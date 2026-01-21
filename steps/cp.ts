import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface CpStep extends BlueprintStep {
	fromPath: string;
	toPath: string;
}

export const cp: StepFunction<CpStep> = ( step: CpStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'cp',
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

cp.description = 'Source path.';
cp.hidden = true;
cp.vars = [
	{
		name: 'fromPath',
		required: true,
	},
	{
		name: 'toPath',
		required: true,
	}
];
