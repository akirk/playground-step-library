"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * WordPress Playground Step Library Compiler
 * Transforms blueprints with custom steps into blueprints with native steps
 */
class PlaygroundStepLibrary {
    constructor(options = {}) {
        this.customSteps = {};
        this.stepsDir = options.stepsDir || path.join(__dirname, '../steps');
        this.loadCustomSteps();
    }
    /**
     * Load all custom step definitions from the steps directory
     */
    loadCustomSteps() {
        this.customSteps = {};
        // Load custom steps from steps/ directory
        this.loadStepsFromDirectory(this.stepsDir, false);
        // Load builtin steps from steps/builtin/ directory
        const builtinDir = path.join(this.stepsDir, 'builtin');
        if (fs.existsSync(builtinDir)) {
            this.loadStepsFromDirectory(builtinDir, true);
        }
    }
    /**
     * Load step definitions from a directory
     */
    loadStepsFromDirectory(dir, isBuiltin = false) {
        if (!fs.existsSync(dir)) {
            return;
        }
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        for (const file of files) {
            try {
                const stepName = path.basename(file, '.js');
                const stepPath = path.join(dir, file);
                const stepCode = fs.readFileSync(stepPath, 'utf8');
                // Create a sandbox environment to execute the step code
                const customSteps = {};
                const sandbox = { customSteps };
                // Execute the step code in the sandbox
                const func = new Function('customSteps', stepCode);
                func(customSteps);
                if (customSteps[stepName]) {
                    this.customSteps[stepName] = customSteps[stepName];
                    this.customSteps[stepName].builtin = isBuiltin;
                }
            }
            catch (error) {
                console.warn(`Warning: Failed to load step ${file}:`, error.message);
            }
        }
    }
    /**
     * Compile a blueprint by transforming custom steps into native steps
     */
    compile(blueprint) {
        let parsedBlueprint;
        if (typeof blueprint === 'string') {
            parsedBlueprint = JSON.parse(blueprint);
        }
        else {
            parsedBlueprint = blueprint;
        }
        if (!parsedBlueprint || !parsedBlueprint.steps) {
            throw new Error('Invalid blueprint: missing steps array');
        }
        const compiledBlueprint = {
            ...parsedBlueprint,
            steps: this.compileSteps(parsedBlueprint.steps)
        };
        return compiledBlueprint;
    }
    /**
     * Compile an array of steps
     */
    compileSteps(steps) {
        return this.compileStepsWithDepth(steps, 0);
    }
    /**
     * Compile an array of steps with depth tracking
     */
    compileStepsWithDepth(steps, depth = 0) {
        const compiledSteps = [];
        for (const step of steps) {
            const compiledStep = this.compileStep(step, depth);
            if (Array.isArray(compiledStep)) {
                compiledSteps.push(...compiledStep);
            }
            else {
                compiledSteps.push(compiledStep);
            }
        }
        return compiledSteps;
    }
    /**
     * Compile a single step
     */
    compileStep(step, depth = 0) {
        if (depth > 10) {
            throw new Error(`Maximum compilation depth exceeded for step: ${step.step}`);
        }
        const { step: stepName, ...stepData } = step;
        // Check if this is a custom step (but not a builtin step)
        if (this.customSteps[stepName] && !this.customSteps[stepName].builtin) {
            const customStep = this.customSteps[stepName];
            // Prepare step context with variables
            const stepContext = {
                vars: stepData
            };
            // Execute the custom step transformation
            const transformedSteps = customStep(stepContext);
            // Process variable substitution in the transformed steps
            const processedSteps = this.processVariableSubstitution(transformedSteps, stepData);
            // Recursively compile the transformed steps in case they contain more custom steps
            return this.compileStepsWithDepth(processedSteps, depth + 1);
        }
        // Return the step as-is if it's not a custom step or is a builtin step
        return step;
    }
    /**
     * Process variable substitution in step definitions
     */
    processVariableSubstitution(steps, variables) {
        const stepString = JSON.stringify(steps);
        let processedString = stepString;
        // Replace ${varName} placeholders with actual values
        for (const [varName, varValue] of Object.entries(variables)) {
            const placeholder = `\${${varName}}`;
            const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            processedString = processedString.replace(regex, String(varValue));
        }
        return JSON.parse(processedString);
    }
    /**
     * Get information about available custom steps
     */
    getAvailableSteps() {
        const stepInfo = {};
        for (const [stepName, stepDef] of Object.entries(this.customSteps)) {
            stepInfo[stepName] = {
                description: stepDef.info || '',
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
module.exports = PlaygroundStepLibrary;
//# sourceMappingURL=index.js.map