import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface RmStep extends BlueprintStep {
	path: string;
}

export const rm: StepFunction<RmStep> = ( step: RmStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'rm',
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

rm.description = 'The path to remove.';
rm.hidden = true;
rm.vars = [
	{
		name: 'path',
		required: true,
	}
];
