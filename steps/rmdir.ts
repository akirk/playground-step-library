import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface RmdirStep extends BlueprintStep {
	path: string;
}

export const rmdir: StepFunction<RmdirStep> = ( step: RmdirStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'rmdir',
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

rmdir.description = 'The path to remove.';
rmdir.hidden = true;
rmdir.vars = [
	{
		name: 'path',
		required: true,
	}
];
