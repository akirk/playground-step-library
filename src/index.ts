import * as fs from 'fs';
import * as path from 'path';

interface StepVariable {
    name: string;
    description?: string;
    required?: boolean;
    type?: string;
    samples?: string[];
    regex?: string;
}

interface CustomStepDefinition {
    (step: { vars: Record<string, any> }): any[];
    description?: string;
    vars?: StepVariable[];
    builtin?: boolean;
    multiple?: boolean;
}

interface BlueprintStep {
    step: string;
    [key: string]: any;
}

interface Blueprint {
    steps: BlueprintStep[];
    [key: string]: any;
}

interface ValidationResult {
    valid: boolean;
    error?: string;
}

interface CompilerOptions {
    stepsDir?: string;
}

interface StepInfo {
    description: string;
    vars: StepVariable[];
    builtin: boolean;
    multiple: boolean;
}

/**
 * WordPress Playground Step Library Compiler
 * Transforms blueprints with custom steps into blueprints with native steps
 */
class PlaygroundStepLibrary {
    private customSteps: Record<string, CustomStepDefinition> = {};
    private stepsDir: string;

    constructor(options: CompilerOptions = {}) {
        this.stepsDir = options.stepsDir || path.join(__dirname, '../steps');
        this.loadCustomSteps();
    }

    /**
     * Load all custom step definitions from the steps directory
     */
    private loadCustomSteps(): void {
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
    private loadStepsFromDirectory(dir: string, isBuiltin = false): void {
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
                const customSteps: Record<string, CustomStepDefinition> = {};
                const sandbox = { customSteps };
                
                // Execute the step code in the sandbox
                const func = new Function('customSteps', stepCode);
                func(customSteps);
                
                if (customSteps[stepName]) {
                    this.customSteps[stepName] = customSteps[stepName];
                    this.customSteps[stepName].builtin = isBuiltin;
                }
            } catch (error) {
                console.warn(`Warning: Failed to load step ${file}:`, (error as Error).message);
            }
        }
    }

    /**
     * Compile a blueprint by transforming custom steps into native steps
     */
    compile(blueprint: Blueprint | string): Blueprint {
        let parsedBlueprint: Blueprint;
        
        if (typeof blueprint === 'string') {
            parsedBlueprint = JSON.parse(blueprint);
        } else {
            parsedBlueprint = blueprint;
        }

        if (!parsedBlueprint || !parsedBlueprint.steps) {
            throw new Error('Invalid blueprint: missing steps array');
        }

        const compiledBlueprint: Blueprint = {
            ...parsedBlueprint,
            steps: this.compileSteps(parsedBlueprint.steps)
        };

        return compiledBlueprint;
    }

    /**
     * Compile an array of steps
     */
    private compileSteps(steps: BlueprintStep[]): BlueprintStep[] {
        return this.compileStepsWithDepth(steps, 0);
    }

    /**
     * Compile an array of steps with depth tracking
     */
    private compileStepsWithDepth(steps: BlueprintStep[], depth = 0): BlueprintStep[] {
        const compiledSteps: BlueprintStep[] = [];

        for (const step of steps) {
            const compiledStep = this.compileStep(step, depth);
            if (Array.isArray(compiledStep)) {
                compiledSteps.push(...compiledStep);
            } else {
                compiledSteps.push(compiledStep);
            }
        }

        return compiledSteps;
    }

    /**
     * Compile a single step
     */
    private compileStep(step: BlueprintStep, depth = 0): BlueprintStep | BlueprintStep[] {
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
    private processVariableSubstitution(steps: any[], variables: Record<string, any>): BlueprintStep[] {
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
    getAvailableSteps(): Record<string, StepInfo> {
        const stepInfo: Record<string, StepInfo> = {};
        
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
    validateBlueprint(blueprint: Blueprint | string): ValidationResult {
        let parsedBlueprint: Blueprint;
        
        if (typeof blueprint === 'string') {
            try {
                parsedBlueprint = JSON.parse(blueprint);
            } catch (error) {
                return { valid: false, error: 'Invalid JSON format' };
            }
        } else {
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

export = PlaygroundStepLibrary;