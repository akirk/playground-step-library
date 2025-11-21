import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface RmdirStep extends BlueprintStep {
	path: string;
}

export const rmdir: StepFunction<RmdirStep> = ( step: RmdirStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
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

rmdir.description = 'Remove a directory.';
rmdir.hidden = true;
rmdir.vars = [
	{
		name: 'path',
		description: 'Path to the directory to remove',
		required: true
	}
];
