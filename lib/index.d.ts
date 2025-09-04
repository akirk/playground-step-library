interface StepVariable {
    name: string;
    description?: string;
    required?: boolean;
    type?: string;
    samples?: string[];
    regex?: string;
}
interface BlueprintStep {
    step: string;
    vars?: Record<string, any>;
    count?: number;
    [key: string]: any;
}
interface Blueprint {
    steps?: BlueprintStep[];
    title?: string;
    landingPage?: string;
    features?: Record<string, any>;
    [key: string]: any;
}
interface ValidationResult {
    valid: boolean;
    error?: string;
}
interface CompilerOptions {
    stepsDir?: string;
    landingPage?: string;
    features?: Record<string, any>;
    phpExtensionBundles?: string[];
    preferredVersions?: {
        wp?: string;
        php?: string;
    };
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
declare class PlaygroundStepLibrary {
    private customSteps;
    private stepsDir;
    constructor(options?: CompilerOptions);
    /**
     * Load all custom step definitions from the steps directory
     */
    private loadCustomSteps;
    /**
     * Collect step files from a directory
     */
    private collectStepFiles;
    /**
     * Load all step files with access to the full customSteps object
     */
    private loadStepFiles;
    /**
     * Compile a blueprint by transforming custom steps into native steps
     * Uses the transformJson logic from script.js adapted for TypeScript
     */
    compile(blueprint: Blueprint | string, options?: CompilerOptions): Blueprint;
    /**
     * Get information about available custom steps
     */
    getAvailableSteps(): Record<string, StepInfo>;
    /**
     * Validate a blueprint structure
     */
    validateBlueprint(blueprint: Blueprint | string): ValidationResult;
}
export = PlaygroundStepLibrary;
//# sourceMappingURL=index.d.ts.map