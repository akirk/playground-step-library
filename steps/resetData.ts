import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface ResetDataStep extends BlueprintStep {

}

export const resetData: StepFunction<ResetDataStep> = ( step: ResetDataStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'resetData',

					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

resetData.description = 'Deletes WordPress posts and comments and sets the auto increment sequence.';
resetData.hidden = true;
resetData.vars = [

];
