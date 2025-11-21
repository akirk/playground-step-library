import { stepsRegistry } from './steps-registry.js';
import type {
    StepVariable,
    BlueprintStep,
    StepLibraryBlueprint,
    StepResult
} from '../steps/types.js';
import type { StepDefinition, BlueprintV2Declaration } from '@wp-playground/blueprints';

interface CustomStepDefinition {
    (step: BlueprintStep, inputData?: any): any[] | StepResult;
    description?: string;
    vars?: StepVariable[];
    builtin?: boolean;
    multiple?: boolean;
    count?: number;
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
class PlaygroundStepLibraryV2 {
    private customSteps: Record<string, CustomStepDefinition> = {};

    constructor() {
        this.loadCustomSteps();
    }

    private loadCustomSteps(): void {
        Object.assign(this.customSteps, stepsRegistry);
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

        // Handle title -> meta.title
        if ((inputData as any).title) {
            v2Blueprint.meta = { title: (inputData as any).title };
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

            // Flatten legacy vars format
            if (step.vars) {
                for (const key in step.vars) {
                    if (!(key in step)) {
                        step[key] = step.vars[key];
                    }
                }
                delete step.vars;
            }

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

        if (stepFn) {
            const result = stepFn(step, inputData);

            // New format: StepResult with toV2()
            if (this.isStepResult(result)) {
                return result.toV2();
            }

            // Legacy format: array of steps
            if (Array.isArray(result) && result.length > 0) {
                return {
                    version: 2,
                    steps: result as StepDefinition[]
                };
            }

            return null;
        }

        // Unknown step - pass through as-is
        return {
            version: 2,
            steps: [step as StepDefinition]
        };
    }

    private isStepResult(result: any[] | StepResult): result is StepResult {
        return result && typeof result === 'object' && !Array.isArray(result) && typeof result.toV2 === 'function';
    }

    /**
     * Merge v2 fragments into target blueprint
     */
    private mergeFragments(target: BlueprintV2Declaration, source: BlueprintV2Declaration): void {
        // Arrays: concatenate
        const arrayKeys: (keyof BlueprintV2Declaration)[] = [
            'content', 'users', 'media', 'plugins', 'themes', 'muPlugins',
            'steps', 'additionalStepsAfterExecution'
        ];

        for (const key of arrayKeys) {
            if (source[key]) {
                (target as any)[key] = [...((target as any)[key] || []), ...(source[key] as any[])];
            }
        }

        // Objects: spread merge
        const objectKeys: (keyof BlueprintV2Declaration)[] = [
            'siteOptions', 'constants', 'postTypes'
        ];

        for (const key of objectKeys) {
            if (source[key]) {
                (target as any)[key] = { ...((target as any)[key] || {}), ...(source[key] as object) };
            }
        }

        // applicationOptions: deep merge
        if (source.applicationOptions) {
            if (!target.applicationOptions) {
                target.applicationOptions = {};
            }
            if (source.applicationOptions['wordpress-playground']) {
                target.applicationOptions['wordpress-playground'] = {
                    ...(target.applicationOptions['wordpress-playground'] || {}),
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

export default PlaygroundStepLibraryV2;
