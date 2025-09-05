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
        const outputData = Object.assign({}, inputData);
        if (outputData.title) {
            delete outputData.title;
        }
        outputData.steps = [];
        inputData.steps.forEach((step, index) => {
            let outSteps = [];
            if (!step.vars) {
                step.vars = {};
            }
            // Move all step properties (except 'step' and 'vars') into vars
            for (const key in step) {
                if (key !== 'step' && key !== 'vars') {
                    step.vars[key] = step[key];
                }
            }
            step.vars.stepIndex = index;
            if (this.customSteps[step.step]) {
                outSteps = this.customSteps[step.step](step, inputData);
                if (typeof outSteps !== 'object') {
                    outSteps = [];
                }
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
            }
            else {
                outSteps.push(step);
            }
            for (let i = 0; i < outSteps.length; i++) {
                if (typeof outSteps[i] !== 'object') {
                    continue;
                }
                // Handle query params (removed from node environment)
                if (typeof outSteps[i].queryParams === 'object') {
                    delete outSteps[i].queryParams;
                }
                // Variable substitution
                if (step.vars) {
                    Object.keys(step.vars).forEach(key => {
                        for (let j in outSteps[i]) {
                            if (typeof outSteps[i][j] === 'object') {
                                Object.keys(outSteps[i][j]).forEach(k => {
                                    if (typeof outSteps[i][j][k] === 'string' && outSteps[i][j][k].includes('${' + key + '}')) {
                                        outSteps[i][j][k] = outSteps[i][j][k].replace('${' + key + '}', step.vars[key]);
                                    }
                                });
                            }
                            else if (typeof outSteps[i][j] === 'string' && outSteps[i][j].includes('${' + key + '}')) {
                                outSteps[i][j] = outSteps[i][j].replace('${' + key + '}', step.vars[key]);
                            }
                        }
                    });
                }
                // Remove unnecessary whitespace
                for (let j in outSteps[i]) {
                    if (typeof outSteps[i][j] === 'string') {
                        outSteps[i][j] = outSteps[i][j].replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\n\s+/g, '\n');
                    }
                    else if (typeof outSteps[i][j] === 'object') {
                        Object.keys(outSteps[i][j]).forEach(k => {
                            if (typeof outSteps[i][j][k] === 'string') {
                                outSteps[i][j][k] = outSteps[i][j][k].replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\n\s+/g, '\n');
                            }
                        });
                    }
                }
            }
            if (outSteps) {
                for (let i = 0; i < outSteps.length; i++) {
                    // Deduplication logic
                    if (outSteps[i].dedup === undefined || outSteps[i].dedup || outSteps[i].dedup === 'last') {
                        let dedupIndex = -1;
                        const dedupStep = outputData.steps.find((step, index) => {
                            for (let j in step) {
                                if (outSteps[i][j] === undefined) {
                                    return false;
                                }
                                if (typeof step[j] === 'object') {
                                    if (JSON.stringify(step[j]) !== JSON.stringify(outSteps[i][j])) {
                                        return false;
                                    }
                                }
                                else if (step[j] !== outSteps[i][j]) {
                                    return false;
                                }
                            }
                            dedupIndex = index;
                            return true;
                        });
                        if (outSteps[i].dedup === 'last' && dedupIndex !== -1) {
                            outputData.steps.splice(dedupIndex, 1);
                        }
                        else if (dedupStep) {
                            continue;
                        }
                        if (outSteps[i].dedup) {
                            delete outSteps[i].dedup;
                        }
                    }
                    outputData.steps.push(outSteps[i]);
                }
            }
        });
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
            const step = parsedBlueprint.steps[i];
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
}
export default PlaygroundStepLibrary;
//# sourceMappingURL=index.js.map