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
declare class PlaygroundStepLibrary {
    private customSteps;
    constructor();
    /**
     * Load all steps from the registry
     */
    private loadCustomSteps;
    /**
     * Compile a blueprint by transforming custom steps into native steps
     * Uses the transformJson logic from script.js adapted for TypeScript
     */
    compile(blueprint: Blueprint | string, options?: CompileOptions): Blueprint;
    /**
     * Get information about available custom steps
     */
    getAvailableSteps(): Record<string, StepInfo>;
    /**
     * Validate a blueprint structure
     */
    validateBlueprint(blueprint: Blueprint | string): ValidationResult;
}
export default PlaygroundStepLibrary;
//# sourceMappingURL=index.d.ts.map