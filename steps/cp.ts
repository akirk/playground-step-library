import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface CpStep extends BlueprintStep {
	fromPath: string;
	toPath: string;
}

export const cp: StepFunction<CpStep> = ( step: CpStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
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

cp.description = 'Copy a file or directory.';
cp.hidden = true;
cp.vars = [
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
