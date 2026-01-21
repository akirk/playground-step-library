import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface MvStep extends BlueprintStep {
	fromPath: string;
	toPath: string;
}

export const mv: StepFunction<MvStep> = ( step: MvStep ): StepResult => {
	return {
		toV1() {
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

mv.description = 'Source path.';
mv.hidden = true;
mv.vars = [
	{
		name: 'fromPath',
		required: true,
	},
	{
		name: 'toPath',
		required: true,
	}
];
