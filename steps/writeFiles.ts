import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface FileTree {
	[key: string]: string | Uint8Array | FileTree;
}

export interface DirectoryResource {
	resource?: 'literal:directory' | 'git:directory';
	name: string;
	files: FileTree;
	url?: string;
	ref?: string;
	path?: string;
}

export interface WriteFilesStep extends BlueprintStep {
	writeToPath: string;
	filesTree: DirectoryResource;
}

export const writeFiles: StepFunction<WriteFilesStep> = ( step: WriteFilesStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [{
					step: 'writeFiles',
					writeToPath: step.writeToPath,
					filesTree: step.filesTree
				} as unknown as import('@wp-playground/blueprints').StepDefinition]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

writeFiles.description = 'The path of the file to write to.';
writeFiles.hidden = true;
writeFiles.vars = [
	{
		name: 'writeToPath',
		required: true,
	},
	{
		name: 'filesTree',
		description: 'The \'filesTree\' defines the directory structure, supporting \'literal:directory\' or',
		required: true,
	}
];
