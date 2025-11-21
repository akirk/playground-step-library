import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface MvStep extends BlueprintStep {
	fromPath: string;
	toPath: string;
}

export const mv: StepFunction<MvStep> = ( step: MvStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
			return {
				steps: [
					{
						step: 'mv',
						fromPath: step.fromPath,
						toPath: step.toPath
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

mv.description = 'Move a file or directory.';
mv.hidden = true;
mv.vars = [
	{
		name: 'fromPath',
		description: 'Source path',
		required: true
	},
	{
		name: 'toPath',
		description: 'Destination path',
		required: true
	}
];
