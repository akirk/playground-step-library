import { stepsRegistry } from './steps-registry.js';
import type {
    StepVariable,
    StepFunction,
    BlueprintStep,
    StepLibraryBlueprint,
    StepResult
} from '../steps/types.js';
import type { Blueprint, StepDefinition, BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';
import PlaygroundStepLibraryV2 from './v2-compiler.js';
import { BlueprintDecompiler } from './decompiler.js';
import type { DecompilerResult } from './decompiler.js';

interface CustomStepDefinition {
    (step: BlueprintStep, inputData?: any): any[] | StepResult;
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

export interface TranspileResult {
    v2Blueprint: BlueprintV2Declaration;
    stepLibraryBlueprint: { steps: Array<any> };
    decompilerResult: DecompilerResult;
}

export interface CompileOptions {
    landingPage?: string;
    features?: Record<string, any>;
    preferredVersions?: {
        wp?: string;
        php?: string;
    };
    extraLibraries?: string[];
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
    private lastQueryParams: Record<string, string> = {};

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
     * Execute a custom step and handle both old format (returns array)
     * and new format (returns object with toV1/toV2 methods)
     */
    private executeCustomStep(stepName: string, step: BlueprintStep, inputData: any): BlueprintV1Declaration {
        const result = this.customSteps[stepName](step, inputData);

        // Check if this is a StepResult (new format)
        if (this.isStepResult(result)) {
            return result.toV1();
        }

        // Old format - return array directly, wrap it in a BlueprintV1Declaration
        return { steps: result };
    }

    /**
     * Type guard to check if result is a StepResult object
     */
    private isStepResult(result: any[] | StepResult): result is StepResult {
        return result && typeof result === 'object' && !Array.isArray(result) && typeof result.toV1 === 'function';
    }

    /**
     * Compile a blueprint to v1 format
     * @param blueprint The blueprint to compile
     * @param options Compilation options
     * @returns Compiled v1 blueprint
     */
    compile(blueprint: StepLibraryBlueprint | string, options: CompileOptions = {}): Blueprint {
        this.lastQueryParams = {};
        return this.compileToV1(blueprint, options);
    }

    /**
     * Compile a blueprint to v2 format
     * @param blueprint The blueprint to compile
     * @param options Compilation options
     * @returns Compiled v2 blueprint
     */
    compileV2(blueprint: StepLibraryBlueprint | string, options: CompileOptions = {}): BlueprintV2Declaration {
        const v2Compiler = new PlaygroundStepLibraryV2();
        return v2Compiler.compile(blueprint, options);
    }

    /**
     * Transpile a native v1 blueprint to v2 format
     * Decompiles to step library format, then compiles to v2
     * @param v1Blueprint Native v1 blueprint
     * @returns Transpile result with v2 blueprint and metadata
     */
    transpile(v1Blueprint: any): TranspileResult {
        const decompiler = new BlueprintDecompiler();
        const decompilerResult = decompiler.decompile(v1Blueprint);
        const stepLibraryBlueprint = { steps: decompilerResult.steps };
        const v2Blueprint = this.compileV2(stepLibraryBlueprint);

        return {
            v2Blueprint,
            stepLibraryBlueprint,
            decompilerResult
        };
    }

    /**
     * Get query parameters extracted from the last compilation
     * These are meant to be added to the playground URL, not the blueprint itself
     * @returns Object containing query parameter key-value pairs
     */
    getLastQueryParams(): Record<string, string> {
        return { ...this.lastQueryParams };
    }

    /**
     * Compile a blueprint by transforming custom steps into native steps (v1 format)
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
        const userDefined: any = {
            landingPage: '/',
            features: {},
            ...options
        };

        // Normalize preferredVersions from options: ensure both php and wp are set
        if (options.preferredVersions) {
            userDefined.preferredVersions = {
                wp: options.preferredVersions.wp || 'latest',
                php: options.preferredVersions.php || 'latest'
            };
        }

        // Merge user defined options with input data
        inputData = Object.assign(userDefined, inputData);

        // Extract title from inputData to place it in meta
        const { title, meta, ...inputWithoutTitle } = inputData as any;

        // Create output blueprint with proper typing
        const outputData: Blueprint = {
            ...inputWithoutTitle,
            steps: [],
            meta: title && !meta?.title
                ? { ...meta, title }
                : meta
        };

        inputData.steps!.forEach((stepItem, index) => {
            // Filter out null, undefined, false values and strings
            if (!stepItem || typeof stepItem !== 'object') {
                return;
            }
            
            const step = stepItem as BlueprintStep;
            let customStepResult: BlueprintV1Declaration | null = null;
            
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
                    customStepResult = this.executeCustomStep(step.step, step, inputData);
                } else {
                    // Builtin installPlugin step - pass through
                    customStepResult = { steps: [step as StepDefinition] };
                }
            } else if (step.step === 'installTheme') {
                if ('url' in step) {
                    // Custom installTheme step - transform it
                    customStepResult = this.executeCustomStep(step.step, step, inputData);
                } else {
                    // Builtin installTheme step - pass through
                    customStepResult = { steps: [step as StepDefinition] };
                }
            } else if (step.step === 'defineWpConfigConst') {
                if ('name' in step && 'value' in step) {
                    // Custom defineWpConfigConst step - transform it
                    customStepResult = this.executeCustomStep(step.step, step, inputData);
                } else {
                    // Builtin defineWpConfigConsts step - pass through
                    customStepResult = { steps: [step as StepDefinition] };
                }
            } else if (step.step === 'setSiteOptions') {
                if ('name' in step && 'value' in step) {
                    // Custom setSiteOptions step - transform it
                    customStepResult = this.executeCustomStep(step.step, step, inputData);
                } else {
                    // Builtin setSiteOptions step - pass through
                    customStepResult = { steps: [step as StepDefinition] };
                }
            } else if (this.customSteps[step.step]) {
                // For other custom steps (no builtin equivalent), always transform
                customStepResult = this.executeCustomStep(step.step, step, inputData);
            } else {
                // Pure builtin step - pass through
                customStepResult = { steps: [step as StepDefinition] };
            }

            // Handle blueprint-level properties from custom step result
            if (customStepResult) {
                // Merge blueprint-level properties
                if (customStepResult.landingPage) {
                    outputData.landingPage = customStepResult.landingPage;
                }
                if (customStepResult.features) {
                    outputData.features = customStepResult.features;
                }
                if (customStepResult.login !== undefined) {
                    outputData.login = customStepResult.login;
                }

                // Extract steps array
                let outSteps = customStepResult.steps || [];

                // Only process steps if there are any
		if (outSteps.length > 0) {
			if (step.count) {
				outSteps = outSteps.slice(0, step.count);
			}

			// Process each step for variable substitution and cleanup
			for (let i = 0; i < outSteps.length; i++) {
				if (!outSteps[i] || typeof outSteps[i] !== 'object') continue;
				const processedStep = { ...(outSteps[i] as object) } as any;

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

				// Extract and store query params, then remove them from the step
				if (typeof processedStep.queryParams === 'object') {
					for (const key in processedStep.queryParams) {
						this.lastQueryParams[key] = processedStep.queryParams[key];
					}
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
        if (outputData.landingPage === '/') {
            delete outputData.landingPage;
        }

        if (outputData.features && Object.keys(outputData.features).length === 0) {
            delete outputData.features;
        }

        if (outputData.preferredVersions) {
            const pv = outputData.preferredVersions;
            if (pv.wp === 'latest' && pv.php === 'latest') {
                delete outputData.preferredVersions;
            }
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
export { BlueprintDecompiler } from './decompiler.js';
export type { DecompilerResult } from './decompiler.js';
