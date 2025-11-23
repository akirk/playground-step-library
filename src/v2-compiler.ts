import { stepsRegistry } from './steps-registry.js';
import type {
    StepVariable,
    BlueprintStep,
    StepLibraryBlueprint,
    StepResult
} from '../steps/types.js';
import type { StepDefinition, BlueprintV2Declaration } from '@wp-playground/blueprints';

interface CustomStepDefinition {
    (step: BlueprintStep, inputData?: any): StepResult;
    description?: string;
    vars?: StepVariable[];
    builtin?: boolean;
    multiple?: boolean;
    count?: number;
    hidden?: boolean;
    deprecated?: boolean;
}

export interface CompileV2Options {
    preferredVersions?: {
        wp?: string;
        php?: string;
    };
}

interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * WordPress Playground Step Library V2 Compiler
 * Transforms blueprints with custom steps into native v2 blueprints with declarative schema
 */
class StepLibraryCompilerV2 {
    private customSteps: Record<string, CustomStepDefinition> = {};
    private lastQueryParams: Record<string, string> = {};

    constructor() {
        this.loadCustomSteps();
    }

    private loadCustomSteps(): void {
        Object.assign(this.customSteps, stepsRegistry);
    }

    getLastQueryParams(): Record<string, string> {
        return this.lastQueryParams;
    }

    /**
     * Compile a blueprint to v2 format
     */
    compile(blueprint: StepLibraryBlueprint | string, options: CompileV2Options = {}): BlueprintV2Declaration {
        let inputData: StepLibraryBlueprint;

        if (typeof blueprint === 'string') {
            inputData = JSON.parse(blueprint);
        } else {
            inputData = { ...blueprint };
        }

        if (!inputData || !inputData.steps || !Array.isArray(inputData.steps)) {
            throw new Error('Invalid blueprint: missing steps array');
        }

        // Start with base v2 blueprint
        const v2Blueprint: BlueprintV2Declaration = {
            version: 2
        };

        // Handle title -> blueprintMeta.name
        if ((inputData as any).title) {
            v2Blueprint.blueprintMeta = { name: (inputData as any).title };
        }

        // Handle preferredVersions
        const pv = options.preferredVersions || (inputData as any).preferredVersions;
        if (pv) {
            if (pv.wp && pv.wp !== 'latest') {
                v2Blueprint.wordpressVersion = pv.wp;
            }
            if (pv.php && pv.php !== 'latest') {
                v2Blueprint.phpVersion = pv.php;
            }
        }

        // Handle top-level landingPage/login from input -> applicationOptions
        const inputLandingPage = (inputData as any).landingPage;
        const inputLogin = (inputData as any).login;
        if ((inputLandingPage && inputLandingPage !== '/') || inputLogin !== undefined) {
            v2Blueprint.applicationOptions = {
                'wordpress-playground': {}
            };
            if (inputLandingPage && inputLandingPage !== '/') {
                v2Blueprint.applicationOptions['wordpress-playground'].landingPage = inputLandingPage;
            }
            if (inputLogin !== undefined) {
                v2Blueprint.applicationOptions['wordpress-playground'].login = inputLogin;
            }
        }

        // Process each step and merge v2 fragments
        inputData.steps.forEach((stepItem, index) => {
            if (!stepItem || typeof stepItem !== 'object') {
                return;
            }

            const step = stepItem as BlueprintStep;

            step.stepIndex = index;

            // Get v2 fragments from step
            const fragments = this.getV2Fragments(step, inputData);
            if (fragments) {
                this.mergeFragments(v2Blueprint, fragments);
            }
        });

        // Cleanup empty properties
        this.cleanup(v2Blueprint);

        return v2Blueprint;
    }

    /**
     * Get v2 fragments from a step
     */
    private getV2Fragments(step: BlueprintStep, inputData: any): BlueprintV2Declaration | null {
        const stepFn = this.customSteps[step.step];

        // If step has no `vars`, it's a native step - pass through directly
        // Exception: steps with empty vars array (like dontLogin) have vars as undefined but ARE custom steps
        // So check: if no vars AND (step not in registry OR step has other properties like pluginData)
        if ( !step.vars ) {
            const hasNativeProps = (step as any).pluginData || (step as any).themeData || (step as any).file;
            if ( !stepFn || hasNativeProps ) {
                // Strip internal properties and pass through as native step
                const { stepIndex, ...nativeStep } = step as any;
                return {
                    version: 2,
                    additionalStepsAfterExecution: [nativeStep as StepDefinition]
                } as BlueprintV2Declaration;
            }
        }

        if (stepFn) {
            const result = stepFn(step, inputData);
            return result.toV2();
        }

        // Unknown step - pass through as-is
        return {
            version: 2,
            additionalStepsAfterExecution: [step as StepDefinition]
        } as BlueprintV2Declaration;
    }

    /**
     * Merge v2 fragments into target blueprint
     */
    private mergeFragments(target: BlueprintV2Declaration, source: BlueprintV2Declaration): void {
        // Arrays: concatenate
        const arrayKeys: string[] = [
            'content', 'users', 'media', 'plugins', 'themes', 'muPlugins',
            'additionalStepsAfterExecution'
        ];

        for (const key of arrayKeys) {
            if ((source as any)[key]) {
                (target as any)[key] = [...((target as any)[key] || []), ...((source as any)[key] as any[])];
            }
        }

        // Objects: spread merge
        const objectKeys: string[] = [
            'siteOptions', 'constants', 'postTypes'
        ];

        for (const key of objectKeys) {
            if ((source as any)[key]) {
                (target as any)[key] = { ...((target as any)[key] || {}), ...((source as any)[key] as object) };
            }
        }

        // applicationOptions: deep merge
        if (source.applicationOptions) {
            if (!target.applicationOptions) {
                (target as any).applicationOptions = { 'wordpress-playground': {} };
            }
            if (source.applicationOptions['wordpress-playground']) {
                (target.applicationOptions as any)['wordpress-playground'] = {
                    ...((target.applicationOptions as any)['wordpress-playground'] || {}),
                    ...source.applicationOptions['wordpress-playground']
                };
            }
        }
    }

    /**
     * Remove empty arrays and objects from blueprint
     */
    private cleanup(blueprint: BlueprintV2Declaration): void {
        for (const key of Object.keys(blueprint) as (keyof BlueprintV2Declaration)[]) {
            const value = blueprint[key];
            if (Array.isArray(value) && value.length === 0) {
                delete blueprint[key];
            } else if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
                delete blueprint[key];
            }
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

export default StepLibraryCompilerV2;
export { StepLibraryCompilerV2 };
