import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface MkdirStep extends BlueprintStep {
	path: string;
}

export const mkdir: StepFunction<MkdirStep> = ( step: MkdirStep ): StepResult => {
	return {
		toV1() {
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

mkdir.description = 'The path of the directory you want to create.';
mkdir.hidden = true;
mkdir.vars = [
	{
		name: 'path',
		required: true,
	}
];
