import type { StepFunction, BlueprintStep, StepResult, FileReference } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface WriteFileStep extends BlueprintStep {
	path: string;
	data: FileReference | string | Uint8Array;
}

export const writeFile: StepFunction<WriteFileStep> = ( step: WriteFileStep ): StepResult => {
	return {
		toV1() {
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

writeFile.description = 'The path of the file to write to.';
writeFile.hidden = true;
writeFile.vars = [
	{
		name: 'path',
		required: true,
	},
	{
		name: 'data',
		required: true,
	}
];
