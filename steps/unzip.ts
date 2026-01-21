import type { StepFunction, BlueprintStep, StepResult, FileReference } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface UnzipStep extends BlueprintStep {
	zipFile?: FileReference;
	extractToPath: string;
}

export const unzip: StepFunction<UnzipStep> = ( step: UnzipStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'unzip',
					zipFile: step.zipFile,
					extractToPath: step.extractToPath
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

unzip.description = 'The zip file to extract.';
unzip.hidden = true;
unzip.vars = [
	{
		name: 'zipFile',
	},
	{
		name: 'extractToPath',
		required: true,
	}
];
