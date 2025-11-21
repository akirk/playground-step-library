import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface MkdirStep extends BlueprintStep {
	path: string;
}

export const mkdir: StepFunction<MkdirStep> = ( step: MkdirStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
			return {
				steps: [
					{
						step: 'mkdir',
						path: step.path
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

mkdir.description = 'Create a directory.';
mkdir.hidden = true;
mkdir.vars = [
	{
		name: 'path',
		description: 'Path to the directory to create',
		required: true
	}
];
