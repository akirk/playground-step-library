import { stepsRegistry } from './steps-registry.js';
import type {
    StepVariable,
    BlueprintStep,
    StepLibraryBlueprint,
    StepResult,
    V2SchemaFragments
} from '../steps/types.js';
import type { StepDefinition } from '@wp-playground/blueprints';

interface CustomStepDefinition {
    (step: BlueprintStep, inputData?: any): any[] | StepResult;
    description?: string;
    vars?: StepVariable[];
    builtin?: boolean;
    multiple?: boolean;
    count?: number;
}

export interface CompileV2Options {
    landingPage?: string;
    features?: Record<string, any>;
    preferredVersions?: {
        wp?: string;
        php?: string;
    };
    extraLibraries?: string[];
}

interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * WordPress Playground Step Library V2 Compiler
 * Transforms blueprints with custom steps into native v2 blueprints with declarative schema
 */
class PlaygroundStepLibraryV2 {
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
     * Compile a blueprint to v2 format
     * @param blueprint The blueprint to compile
     * @param options Compilation options
     * @returns Compiled v2 blueprint
     */
    compile(blueprint: StepLibraryBlueprint | string, options: CompileV2Options = {}): any {
        this.lastQueryParams = {};

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

        // Normalize preferredVersions from options
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

        // Create v2 blueprint structure
        const v2Blueprint: any = {
            ...inputWithoutTitle,
            meta: title && !meta?.title
                ? { ...meta, title }
                : meta
        };

        // Remove steps array - we'll build v2 schema
        delete v2Blueprint.steps;

        // Process steps and collect v2 fragments
        const collectedFragments: V2SchemaFragments = {};

        inputData.steps!.forEach((stepItem, index) => {
            if (!stepItem || typeof stepItem !== 'object') {
                return;
            }

            const step = stepItem as BlueprintStep;

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

            // Try to get v2 fragments from the step
            const fragments = this.getV2Fragments(step, inputData);

            if (fragments) {
                this.mergeFragments(collectedFragments, fragments);
            }
        });

        // Apply collected fragments to v2 blueprint
        this.applyFragments(v2Blueprint, collectedFragments);

        // Handle WordPress and PHP versions
        if (v2Blueprint.preferredVersions) {
            const pv = v2Blueprint.preferredVersions;
            if (pv.wp && pv.wp !== 'latest') {
                v2Blueprint.wordpressVersion = pv.wp;
            }
            if (pv.php && pv.php !== 'latest') {
                v2Blueprint.phpVersion = pv.php;
            }
            delete v2Blueprint.preferredVersions;
        }

        // Clean up
        if (v2Blueprint.landingPage === '/') {
            delete v2Blueprint.landingPage;
        }

        if (v2Blueprint.features && Object.keys(v2Blueprint.features).length === 0) {
            delete v2Blueprint.features;
        }

        return v2Blueprint;
    }

    /**
     * Get query parameters extracted from the last compilation
     */
    getLastQueryParams(): Record<string, string> {
        return { ...this.lastQueryParams };
    }

    /**
     * Get v2 fragments from a step
     */
    private getV2Fragments(step: BlueprintStep, inputData: any): V2SchemaFragments | null {
        // Handle discriminated union for steps with both custom and builtin variants
        if (step.step === 'installPlugin') {
            if ('url' in step) {
                return this.executeCustomStepV2(step.step, step, inputData);
            } else {
                // Builtin installPlugin - handle as v2 plugin
                return this.handleBuiltinPlugin(step);
            }
        } else if (step.step === 'installTheme') {
            if ('url' in step) {
                return this.executeCustomStepV2(step.step, step, inputData);
            } else {
                // Builtin installTheme - handle as v2 theme
                return this.handleBuiltinTheme(step);
            }
        } else if (step.step === 'defineWpConfigConst') {
            if ('name' in step && 'value' in step) {
                return this.executeCustomStepV2(step.step, step, inputData);
            } else {
                // Builtin defineWpConfigConsts
                return this.handleBuiltinConstants(step);
            }
        } else if (step.step === 'setSiteOptions') {
            if ('name' in step && 'value' in step) {
                return this.executeCustomStepV2(step.step, step, inputData);
            } else {
                // Builtin setSiteOptions
                return this.handleBuiltinSiteOptions(step);
            }
        } else if (this.customSteps[step.step]) {
            // Custom step
            return this.executeCustomStepV2(step.step, step, inputData);
        } else {
            // Pure builtin step - add to additionalSteps
            return {
                additionalSteps: [step as StepDefinition]
            };
        }
    }

    /**
     * Execute a custom step and get v2 fragments
     */
    private executeCustomStepV2(stepName: string, step: BlueprintStep, inputData: any): V2SchemaFragments | null {
        const result = this.customSteps[stepName](step, inputData);

        // Check if this is a StepResult with toV2 method
        if (this.isStepResult(result)) {
            return result.toV2();
        }

        // Old format - step returns v1 array, add to additionalSteps
        if (Array.isArray(result) && result.length > 0) {
            // Extract query params
            result.forEach((s: any) => {
                if (typeof s.queryParams === 'object') {
                    for (const key in s.queryParams) {
                        this.lastQueryParams[key] = s.queryParams[key];
                    }
                    delete s.queryParams;
                }
            });

            return {
                additionalSteps: result as StepDefinition[]
            };
        }

        return null;
    }

    /**
     * Type guard to check if result is a StepResult object
     */
    private isStepResult(result: any[] | StepResult): result is StepResult {
        return result && typeof result === 'object' && !Array.isArray(result) && typeof result.toV2 === 'function';
    }

    /**
     * Handle builtin installPlugin step
     */
    private handleBuiltinPlugin(step: any): V2SchemaFragments {
        const pluginData = step.pluginData || step;

        if (pluginData.resource === 'wordpress.org/plugins' && pluginData.slug) {
            return {
                plugins: [pluginData.slug]
            };
        }

        // Complex plugin definition
        return {
            additionalSteps: [step]
        };
    }

    /**
     * Handle builtin installTheme step
     */
    private handleBuiltinTheme(step: any): V2SchemaFragments {
        const themeData = step.themeData || step;

        if (themeData.resource === 'wordpress.org/themes' && themeData.slug) {
            return {
                themes: [themeData.slug]
            };
        }

        // Complex theme definition
        return {
            additionalSteps: [step]
        };
    }

    /**
     * Handle builtin defineWpConfigConsts step
     */
    private handleBuiltinConstants(step: any): V2SchemaFragments {
        return {
            constants: step.consts || {}
        };
    }

    /**
     * Handle builtin setSiteOptions step
     */
    private handleBuiltinSiteOptions(step: any): V2SchemaFragments {
        return {
            siteOptions: step.options || {}
        };
    }

    /**
     * Merge v2 fragments into collected fragments
     */
    private mergeFragments(target: V2SchemaFragments, source: V2SchemaFragments): void {
        // Merge arrays by concatenation
        if (source.content) {
            target.content = [...(target.content || []), ...source.content];
        }
        if (source.users) {
            target.users = [...(target.users || []), ...source.users];
        }
        if (source.media) {
            target.media = [...(target.media || []), ...source.media];
        }
        if (source.plugins) {
            target.plugins = [...(target.plugins || []), ...source.plugins];
        }
        if (source.themes) {
            target.themes = [...(target.themes || []), ...source.themes];
        }
        if (source.additionalSteps) {
            target.additionalSteps = [...(target.additionalSteps || []), ...source.additionalSteps];
        }

        // Merge objects by spreading
        if (source.siteOptions) {
            target.siteOptions = { ...(target.siteOptions || {}), ...source.siteOptions };
        }
        if (source.constants) {
            target.constants = { ...(target.constants || {}), ...source.constants };
        }
        if (source.postTypes) {
            target.postTypes = { ...(target.postTypes || {}), ...source.postTypes };
        }
    }

    /**
     * Apply collected fragments to v2 blueprint
     */
    private applyFragments(blueprint: any, fragments: V2SchemaFragments): void {
        // Apply arrays
        if (fragments.content && fragments.content.length > 0) {
            blueprint.content = fragments.content;
        }

        if (fragments.users && fragments.users.length > 0) {
            blueprint.users = fragments.users;
        }

        if (fragments.media && fragments.media.length > 0) {
            blueprint.media = fragments.media;
        }

        if (fragments.plugins && fragments.plugins.length > 0) {
            blueprint.plugins = fragments.plugins;
        }

        if (fragments.themes && fragments.themes.length > 0) {
            blueprint.themes = fragments.themes;
        }

        // Apply objects
        if (fragments.siteOptions && Object.keys(fragments.siteOptions).length > 0) {
            blueprint.siteOptions = fragments.siteOptions;
        }

        if (fragments.constants && Object.keys(fragments.constants).length > 0) {
            blueprint.constants = fragments.constants;
        }

        if (fragments.postTypes && Object.keys(fragments.postTypes).length > 0) {
            blueprint.postTypes = fragments.postTypes;
        }

        // Apply additionalSteps (after execution in v2)
        if (fragments.additionalSteps && fragments.additionalSteps.length > 0) {
            blueprint.additionalStepsAfterExecution = fragments.additionalSteps;
        }
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

        return { valid: true };
    }
}

export default PlaygroundStepLibraryV2;
