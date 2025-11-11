import { stepsRegistry } from './steps-registry.js';
import type {
    StepVariable,
    StepFunction,
    BlueprintStep,
    StepLibraryBlueprint
} from '../steps/types.js';
import type { Blueprint, StepDefinition } from '@wp-playground/blueprints';
import { transpileToV2, shouldTranspileToV2 } from './v2-transpiler.js';

interface CustomStepDefinition {
    (step: BlueprintStep, inputData?: any): any[];
    description?: string;
    vars?: StepVariable[];
    builtin?: boolean;
    multiple?: boolean;
    count?: number;
}


interface ValidationResult {
    valid: boolean;
    error?: string;
}

interface CompileOptions {
    landingPage?: string;
    features?: Record<string, any>;
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

    constructor() {
        this.loadCustomSteps();
    }

    /**
     * Load all steps from the registry
     */
    private loadCustomSteps(): void {
        Object.assign(this.customSteps, stepsRegistry);
    }

    /**
     * Compile a blueprint and optionally transpile to v2 format
     * @param blueprint The blueprint to compile
     * @param options Compilation options
     * @param toV2 If true, transpile the result to Blueprint v2 format
     * @returns Compiled blueprint (v1 or v2 depending on toV2 parameter)
     */
    compile(blueprint: StepLibraryBlueprint | string, options: CompileOptions = {}, toV2: boolean = false): Blueprint | any {
        const compiledV1 = this.compileToV1(blueprint, options);

        if (toV2) {
            return transpileToV2(compiledV1);
        }

        return compiledV1;
    }

    /**
     * Compile a blueprint by transforming custom steps into native steps (v1 format)
     * Uses the transformJson logic from script.js adapted for TypeScript
     */
    private compileToV1(blueprint: StepLibraryBlueprint | string, options: CompileOptions = {}): Blueprint {
        let inputData: StepLibraryBlueprint;

        if (typeof blueprint === 'string') {
            inputData = JSON.parse(blueprint);
        } else {
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
        const outputData: Blueprint = {
            ...inputData,
            steps: []
        };

        if ('title' in outputData) {
            delete (outputData as any).title;
        }

        inputData.steps!.forEach((stepItem, index) => {
            // Filter out null, undefined, false values and strings
            if (!stepItem || typeof stepItem !== 'object') {
                return;
            }
            
            const step = stepItem as BlueprintStep;
            let outSteps: StepDefinition[] = [];
            
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
                } else {
                    // Builtin installPlugin step - pass through
                    outSteps.push(step as StepDefinition);
                }
            } else if (step.step === 'installTheme') {
                if ('url' in step) {
                    // Custom installTheme step - transform it
                    outSteps = this.customSteps[step.step](step, inputData);
                } else {
                    // Builtin installTheme step - pass through
                    outSteps.push(step as StepDefinition);
                }
            } else if (step.step === 'defineWpConfigConst') {
                if ('name' in step && 'value' in step) {
                    // Custom defineWpConfigConst step - transform it
                    outSteps = this.customSteps[step.step](step, inputData);
                } else {
                    // Builtin defineWpConfigConsts step - pass through
                    outSteps.push(step as StepDefinition);
                }
            } else if (step.step === 'setSiteOptions') {
                if ('name' in step && 'value' in step) {
                    // Custom setSiteOptions step - transform it
                    outSteps = this.customSteps[step.step](step, inputData);
                } else {
                    // Builtin setSiteOptions step - pass through
                    outSteps.push(step as StepDefinition);
                }
            } else if (this.customSteps[step.step]) {
                // For other custom steps (no builtin equivalent), always transform
                outSteps = this.customSteps[step.step](step, inputData);
            } else {
                // Pure builtin step - pass through
                outSteps.push(step as StepDefinition);
            }

            // Handle transformed step results
            if (Array.isArray(outSteps)) {
                // Check for blueprint-level properties even on empty arrays
                if ((outSteps as any).landingPage) {
                    (outputData as any).landingPage = (outSteps as any).landingPage;
                }
                if ((outSteps as any).features) {
                    (outputData as any).features = (outSteps as any).features;
                }
                if ((outSteps as any).login) {
                    (outputData as any).login = (outSteps as any).login;
                }

                // Only process steps if there are any
		if (outSteps.length > 0) {
			if (step.count) {
				outSteps = outSteps.slice(0, step.count);
			}

			// Process each step for variable substitution and cleanup
			for (let i = 0; i < outSteps.length; i++) {
				const processedStep = { ...outSteps[i] } as any;

				// Preserve or add progress caption from original step
				if (step.progress) {
					if (!processedStep.progress) {
						processedStep.progress = {};
					}
					if (step.progress.caption) {
						processedStep.progress.caption = step.progress.caption;
					}
					if (step.progress.weight !== undefined) {
						processedStep.progress.weight = step.progress.weight;
					}
				}

				// Handle query params (removed from node environment)
				if (typeof processedStep.queryParams === 'object') {
					delete processedStep.queryParams;
				}

				// Variable substitution
				Object.keys(step).forEach(key => {
						if (key === 'step' || key === 'stepIndex' || key === 'progress') return;

						this.performVariableSubstitution(processedStep, key, step[key]);
						});

				// Remove unnecessary whitespace
				this.cleanupWhitespace(processedStep);

				// Add to output steps
				outputData.steps!.push(processedStep);
			}
		}
            }
        });

        // Perform deduplication based on PHP comments
        outputData.steps = this.deduplicateSteps(outputData.steps!);

        // Clean up output data
        if ((outputData as any).landingPage === '/') {
            delete (outputData as any).landingPage;
        }

        if ((outputData as any).features && Object.keys((outputData as any).features).length === 0) {
            delete (outputData as any).features;
        }

        if (outputData.steps!.length === 0) {
            delete outputData.steps;
        }

        return outputData;
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
    validateBlueprint(blueprint: StepLibraryBlueprint | string): ValidationResult {
        let parsedBlueprint: StepLibraryBlueprint;

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
        for (let i = 0; i < parsedBlueprint.steps!.length; i++) {
            const stepItem = parsedBlueprint.steps![i];
            
            // Skip null, undefined, false values and strings
            if (!stepItem || typeof stepItem !== 'object') {
                continue;
            }
            
            const step = stepItem as BlueprintStep;

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
    private performVariableSubstitution(obj: any, key: string, value: any): void {
        for (let prop in obj) {
            if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                Object.keys(obj[prop]).forEach(k => {
                    if (typeof obj[prop][k] === 'string' && obj[prop][k].includes('${' + key + '}')) {
                        obj[prop][k] = obj[prop][k].replace('${' + key + '}', value);
                    }
                });
            } else if (typeof obj[prop] === 'string' && obj[prop].includes('${' + key + '}')) {
                obj[prop] = obj[prop].replace('${' + key + '}', value);
            }
        }
    }

    /**
     * Helper method to clean up whitespace in step properties
     */
    private cleanupWhitespace(obj: any): void {
        for (let prop in obj) {
            if (typeof obj[prop] === 'string') {
                obj[prop] = obj[prop].replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\n\s+/g, '\n');
            } else if (typeof obj[prop] === 'object' && obj[prop] !== null) {
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
    private deduplicateSteps(steps: Array<StepDefinition | string | undefined | false | null>): Array<StepDefinition | string | undefined | false | null> {
        const result: Array<StepDefinition | string | undefined | false | null> = [];
        const seenSteps = new Map<string, number[]>(); // JSON string -> array of indices

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
            seenSteps.get(stepJson)!.push(index);
            result.push(stepItem);
        });

        // Second pass: handle duplicates based on dedup strategy
        const toRemove = new Set<number>();

        seenSteps.forEach((indices, stepJson) => {
            if (indices.length > 1) {
                const step = JSON.parse(stepJson) as any;
                const hasKeepLastStrategy = step.step === 'runPHP' && 
                    step.code && 
                    typeof step.code === 'string' && 
                    step.code.includes('// DEDUP_STRATEGY: keep_last');

                if (hasKeepLastStrategy) {
                    // Keep last, remove all previous duplicates
                    for (let i = 0; i < indices.length - 1; i++) {
                        toRemove.add(indices[i]);
                    }
                } else {
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
