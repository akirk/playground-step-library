import { stepsRegistry } from './steps-registry.js';
/**
 * WordPress Playground Step Library Compiler
 * Transforms blueprints with custom steps into blueprints with native steps
 */
class PlaygroundStepLibrary {
    constructor() {
        this.customSteps = {};
        this.loadCustomSteps();
    }
    /**
     * Load all steps from the registry
     */
    loadCustomSteps() {
        Object.assign(this.customSteps, stepsRegistry);
    }
    /**
     * Compile a blueprint by transforming custom steps into native steps
     * Uses the transformJson logic from script.js adapted for TypeScript
     */
    compile(blueprint, options = {}) {
        let inputData;
        if (typeof blueprint === 'string') {
            inputData = JSON.parse(blueprint);
        }
        else {
            inputData = { ...blueprint };
        }
        if (!inputData || !inputData.steps || !Array.isArray(inputData.steps)) {
            throw new Error('Invalid blueprint: missing steps array');
        }
        // Default user-defined options
        const userDefined = {
            landingPage: '/',
            features: {},
            ...options
        };
        // Merge user defined options with input data
        inputData = Object.assign(userDefined, inputData);
        // Create output blueprint with proper typing
        const outputData = {
            ...inputData,
            steps: []
        };
        if ('title' in outputData) {
            delete outputData.title;
        }
        inputData.steps.forEach((stepItem, index) => {
            // Filter out null, undefined, false values and strings
            if (!stepItem || typeof stepItem !== 'object') {
                return;
            }
            const step = stepItem;
            let outSteps = [];
            // Support legacy format: if step has vars, flatten them to top level
            if (step.vars) {
                for (const key in step.vars) {
                    if (!(key in step)) {
                        step[key] = step.vars[key];
                    }
                }
                delete step.vars;
            }
            step.stepIndex = index;
            // TypeScript discriminated union logic for step type determination
            // Since interfaces are erased at runtime, we can't use instanceof with TypeScript interfaces.
            // Instead, we use discriminated unions based on the properties that exist on the step object.
            // For steps that have both custom and builtin variants (like installPlugin), we check
            // for distinguishing properties:
            // - Custom installPlugin: has 'url' property
            // - Builtin installPlugin: has 'pluginData' property
            // This allows TypeScript to narrow the type and lets us decide whether to transform
            // the step using our custom functions or pass it through as a builtin step.
            // Use discriminated union logic to determine step type
            if (step.step === 'installPlugin') {
                if ('url' in step) {
                    // Custom installPlugin step - transform it
                    outSteps = this.customSteps[step.step](step, inputData);
                }
                else {
                    // Builtin installPlugin step - pass through
                    outSteps.push(step);
                }
            }
            else if (step.step === 'installTheme') {
                if ('url' in step) {
                    // Custom installTheme step - transform it
                    outSteps = this.customSteps[step.step](step, inputData);
                }
                else {
                    // Builtin installTheme step - pass through
                    outSteps.push(step);
                }
            }
            else if (step.step === 'defineWpConfigConst') {
                if ('name' in step && 'value' in step) {
                    // Custom defineWpConfigConst step - transform it
                    outSteps = this.customSteps[step.step](step, inputData);
                }
                else {
                    // Builtin defineWpConfigConsts step - pass through
                    outSteps.push(step);
                }
            }
            else if (step.step === 'setSiteOptions') {
                if ('name' in step && 'value' in step) {
                    // Custom setSiteOptions step - transform it
                    outSteps = this.customSteps[step.step](step, inputData);
                }
                else {
                    // Builtin setSiteOptions step - pass through
                    outSteps.push(step);
                }
            }
            else if (this.customSteps[step.step]) {
                // For other custom steps (no builtin equivalent), always transform
                outSteps = this.customSteps[step.step](step, inputData);
            }
            else {
                // Pure builtin step - pass through
                outSteps.push(step);
            }
            // Handle transformed step results
            if (Array.isArray(outSteps) && outSteps.length > 0) {
                if (outSteps.landingPage) {
                    outputData.landingPage = outSteps.landingPage;
                }
                if (outSteps.features) {
                    outputData.features = outSteps.features;
                }
                if (outSteps.login) {
                    outputData.login = outSteps.login;
                }
                if (step.count) {
                    outSteps = outSteps.slice(0, step.count);
                }
                // Process each step for variable substitution and cleanup
                for (let i = 0; i < outSteps.length; i++) {
                    const processedStep = { ...outSteps[i] };
                    // Handle query params (removed from node environment)
                    if (typeof processedStep.queryParams === 'object') {
                        delete processedStep.queryParams;
                    }
                    // Variable substitution
                    Object.keys(step).forEach(key => {
                        if (key === 'step' || key === 'stepIndex')
                            return;
                        this.performVariableSubstitution(processedStep, key, step[key]);
                    });
                    // Remove unnecessary whitespace
                    this.cleanupWhitespace(processedStep);
                    // Add to output steps
                    outputData.steps.push(processedStep);
                }
            }
        });
        // Perform deduplication based on PHP comments
        outputData.steps = this.deduplicateSteps(outputData.steps);
        // Clean up output data
        if (outputData.landingPage === '/') {
            delete outputData.landingPage;
        }
        if (outputData.features && Object.keys(outputData.features).length === 0) {
            delete outputData.features;
        }
        if (outputData.steps.length === 0) {
            delete outputData.steps;
        }
        return outputData;
    }
    /**
     * Get information about available custom steps
     */
    getAvailableSteps() {
        const stepInfo = {};
        for (const [stepName, stepDef] of Object.entries(this.customSteps)) {
            stepInfo[stepName] = {
                description: stepDef.description || '',
                vars: stepDef.vars || [],
                builtin: stepDef.builtin || false,
                multiple: stepDef.multiple || false
            };
        }
        return stepInfo;
    }
    /**
     * Validate a blueprint structure
     */
    validateBlueprint(blueprint) {
        let parsedBlueprint;
        if (typeof blueprint === 'string') {
            try {
                parsedBlueprint = JSON.parse(blueprint);
            }
            catch (error) {
                return { valid: false, error: 'Invalid JSON format' };
            }
        }
        else {
            parsedBlueprint = blueprint;
        }
        if (!parsedBlueprint || typeof parsedBlueprint !== 'object') {
            return { valid: false, error: 'Blueprint must be an object' };
        }
        if (!parsedBlueprint.steps || !Array.isArray(parsedBlueprint.steps)) {
            return { valid: false, error: 'Blueprint must contain a steps array' };
        }
        // Validate each step
        for (let i = 0; i < parsedBlueprint.steps.length; i++) {
            const stepItem = parsedBlueprint.steps[i];
            // Skip null, undefined, false values and strings
            if (!stepItem || typeof stepItem !== 'object') {
                continue;
            }
            const step = stepItem;
            if (!step.step || typeof step.step !== 'string') {
                return { valid: false, error: `Step ${i} must have a 'step' property with step name` };
            }
            // Check if step exists (custom or assumed native)
            const stepName = step.step;
            if (this.customSteps[stepName]) {
                const customStep = this.customSteps[stepName];
                if (customStep.vars) {
                    // Validate required variables
                    for (const varDef of customStep.vars) {
                        if (varDef.required && !step.hasOwnProperty(varDef.name)) {
                            return {
                                valid: false,
                                error: `Step ${i} (${stepName}) is missing required variable: ${varDef.name}`
                            };
                        }
                    }
                }
            }
        }
        return { valid: true };
    }
    /**
     * Helper method for variable substitution in step properties
     */
    performVariableSubstitution(obj, key, value) {
        for (let prop in obj) {
            if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                Object.keys(obj[prop]).forEach(k => {
                    if (typeof obj[prop][k] === 'string' && obj[prop][k].includes('${' + key + '}')) {
                        obj[prop][k] = obj[prop][k].replace('${' + key + '}', value);
                    }
                });
            }
            else if (typeof obj[prop] === 'string' && obj[prop].includes('${' + key + '}')) {
                obj[prop] = obj[prop].replace('${' + key + '}', value);
            }
        }
    }
    /**
     * Helper method to clean up whitespace in step properties
     */
    cleanupWhitespace(obj) {
        for (let prop in obj) {
            if (typeof obj[prop] === 'string') {
                obj[prop] = obj[prop].replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\n\s+/g, '\n');
            }
            else if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                Object.keys(obj[prop]).forEach(k => {
                    if (typeof obj[prop][k] === 'string') {
                        obj[prop][k] = obj[prop][k].replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\n\s+/g, '\n');
                    }
                });
            }
        }
    }
    /**
     * Deduplicates steps based on PHP comment strategies
     */
    deduplicateSteps(steps) {
        const result = [];
        const seenSteps = new Map(); // JSON string -> array of indices
        // First pass: collect all steps and their positions
        steps.forEach((stepItem, index) => {
            if (!stepItem || typeof stepItem !== 'object') {
                result.push(stepItem);
                return;
            }
            const stepJson = JSON.stringify(stepItem);
            if (!seenSteps.has(stepJson)) {
                seenSteps.set(stepJson, []);
            }
            seenSteps.get(stepJson).push(index);
            result.push(stepItem);
        });
        // Second pass: handle duplicates based on dedup strategy
        const toRemove = new Set();
        seenSteps.forEach((indices, stepJson) => {
            if (indices.length > 1) {
                const step = JSON.parse(stepJson);
                const hasKeepLastStrategy = step.step === 'runPHP' &&
                    step.code &&
                    typeof step.code === 'string' &&
                    step.code.includes('// DEDUP_STRATEGY: keep_last');
                if (hasKeepLastStrategy) {
                    // Keep last, remove all previous duplicates
                    for (let i = 0; i < indices.length - 1; i++) {
                        toRemove.add(indices[i]);
                    }
                }
                else {
                    // Default: keep first, remove all following duplicates
                    for (let i = 1; i < indices.length; i++) {
                        toRemove.add(indices[i]);
                    }
                }
            }
        });
        // Return filtered result
        return result.filter((_, index) => !toRemove.has(index));
    }
}
export default PlaygroundStepLibrary;
//# sourceMappingURL=index.js.map