import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface ActivateThemeStep extends BlueprintStep {
	themeFolderName: string;
}

export const activateTheme: StepFunction<ActivateThemeStep> = ( step: ActivateThemeStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'activateTheme',
					themeFolderName: step.themeFolderName
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

activateTheme.description = 'The name of the theme folder inside wp-content/themes/.';
activateTheme.hidden = true;
activateTheme.vars = [
	{
		name: 'themeFolderName',
		description: 'The name of the theme folder inside wp-content/themes/',
		required: true,
	}
];
