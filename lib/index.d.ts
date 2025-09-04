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
declare class PlaygroundStepLibrary {
    private customSteps;
    private stepsDir;
    constructor(options?: CompilerOptions);
    /**
     * Load all custom step definitions from the steps directory
     */
    private loadCustomSteps;
    /**
     * Load step definitions from a directory
     */
    private loadStepsFromDirectory;
    /**
     * Compile a blueprint by transforming custom steps into native steps
     */
    compile(blueprint: Blueprint | string): Blueprint;
    /**
     * Compile an array of steps
     */
    private compileSteps;
    /**
     * Compile an array of steps with depth tracking
     */
    private compileStepsWithDepth;
    /**
     * Compile a single step
     */
    private compileStep;
    /**
     * Process variable substitution in step definitions
     */
    private processVariableSubstitution;
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