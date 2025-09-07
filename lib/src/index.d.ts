import type { StepVariable, StepLibraryBlueprint } from '../steps/types.js';
import type { Blueprint } from '@wp-playground/blueprints';
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
    compile(blueprint: StepLibraryBlueprint | string, options?: CompileOptions): Blueprint;
    /**
     * Get information about available custom steps
     */
    getAvailableSteps(): Record<string, StepInfo>;
    /**
     * Validate a blueprint structure
     */
    validateBlueprint(blueprint: StepLibraryBlueprint | string): ValidationResult;
    /**
     * Helper method for variable substitution in step properties
     */
    private performVariableSubstitution;
    /**
     * Helper method to clean up whitespace in step properties
     */
    private cleanupWhitespace;
    /**
     * Deduplicates steps based on PHP comment strategies
     */
    private deduplicateSteps;
}
export default PlaygroundStepLibrary;
//# sourceMappingURL=index.d.ts.map