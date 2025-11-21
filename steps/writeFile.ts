import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface WriteFileStep extends BlueprintStep {
	path: string;
	data: any;
}

export const writeFile: StepFunction<WriteFileStep> = ( step: WriteFileStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
			return {
				steps: [
					{
						step: 'writeFile',
						path: step.path,
						data: step.data
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

writeFile.description = 'Write content to a file.';
writeFile.hidden = true;
writeFile.vars = [
	{
		name: 'path',
		description: 'Path to the file to write',
		required: true
	},
	{
		name: 'data',
		description: 'Content to write to the file',
		required: true,
		type: 'textarea'
	}
];
