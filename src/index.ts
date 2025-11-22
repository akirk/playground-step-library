/**
 * WordPress Playground Step Library
 * Main entry point
 */

import { StepLibraryCompiler, type CompileOptions, type StepInfo, type ValidationResult } from './v1-compiler.js';
import { StepLibraryCompilerV2 } from './v2-compiler.js';
import { BlueprintDecompiler, type DecompilerResult } from './decompiler.js';
import type { StepLibraryBlueprint } from '../steps/types.js';
import type { Blueprint, BlueprintV2Declaration } from '@wp-playground/blueprints';

export interface TranspileResult {
    v2Blueprint: BlueprintV2Declaration;
    stepLibraryBlueprint: { steps: Array<any> };
    decompilerResult: DecompilerResult;
}

/**
 * WordPress Playground Step Library
 * Unified API for compiling step library blueprints to native formats
 */
class PlaygroundStepLibrary {
    private v1Compiler = new StepLibraryCompiler();
    private v2Compiler = new StepLibraryCompilerV2();

    /**
     * Compile a blueprint to v1 format
     */
    compile( blueprint: StepLibraryBlueprint | string, options: CompileOptions = {} ): Blueprint {
        return this.v1Compiler.compile( blueprint, options );
    }

    /**
     * Compile a blueprint to v2 format
     */
    compileV2( blueprint: StepLibraryBlueprint | string, options: CompileOptions = {} ): BlueprintV2Declaration {
        return this.v2Compiler.compile( blueprint, options );
    }

    /**
     * Transpile a native v1 blueprint to v2 format
     * Decompiles to step library format, then compiles to v2
     */
    transpile( v1Blueprint: any ): TranspileResult {
        const decompiler = new BlueprintDecompiler();
        const decompilerResult = decompiler.decompile( v1Blueprint );
        const stepLibraryBlueprint = { steps: decompilerResult.steps };
        const v2Blueprint = this.compileV2( stepLibraryBlueprint );

        return {
            v2Blueprint,
            stepLibraryBlueprint,
            decompilerResult
        };
    }

    /**
     * Get query parameters extracted from the last compilation
     */
    getLastQueryParams(): Record<string, string> {
        return this.v1Compiler.getLastQueryParams();
    }

    /**
     * Get information about available custom steps
     */
    getAvailableSteps(): Record<string, StepInfo> {
        return this.v1Compiler.getAvailableSteps();
    }

    /**
     * Validate a blueprint structure
     */
    validateBlueprint( blueprint: StepLibraryBlueprint | string ): ValidationResult {
        return this.v1Compiler.validateBlueprint( blueprint );
    }
}

export default PlaygroundStepLibrary;
export { PlaygroundStepLibrary };

// Compilers
export { StepLibraryCompiler } from './v1-compiler.js';
export { StepLibraryCompilerV2 } from './v2-compiler.js';

// Decompiler
export { BlueprintDecompiler } from './decompiler.js';
export type { DecompilerResult } from './decompiler.js';

// Types
export type { CompileOptions, StepInfo, ValidationResult } from './v1-compiler.js';
