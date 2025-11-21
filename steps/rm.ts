import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface RmStep extends BlueprintStep {
	path: string;
}

export const rm: StepFunction<RmStep> = ( step: RmStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
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

rm.description = 'Remove a file.';
rm.hidden = true;
rm.vars = [
	{
		name: 'path',
		description: 'Path to the file to remove',
		required: true
	}
];
