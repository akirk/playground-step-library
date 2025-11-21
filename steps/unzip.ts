import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface UnzipStep extends BlueprintStep {
	zipFile: any;
	zipPath?: string;
	extractToPath: string;
}

export const unzip: StepFunction<UnzipStep> = ( step: UnzipStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
			const unzipStep: any = {
				step: 'unzip',
				extractToPath: step.extractToPath
			};

			if ( step.zipFile ) {
				unzipStep.zipFile = step.zipFile;
			}
			if ( step.zipPath ) {
				unzipStep.zipPath = step.zipPath;
			}

			return {
				steps: [ unzipStep ]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

unzip.description = 'Extract a zip file.';
unzip.hidden = true;
unzip.vars = [
	{
		name: 'zipFile',
		description: 'The zip file resource to extract'
	},
	{
		name: 'zipPath',
		description: 'Path to an existing zip file in the filesystem'
	},
	{
		name: 'extractToPath',
		description: 'Path where the zip contents should be extracted',
		required: true
	}
];
