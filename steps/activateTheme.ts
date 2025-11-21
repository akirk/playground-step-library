import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface ActivateThemeStep extends BlueprintStep {
	themeFolderName: string;
}

export const activateTheme: StepFunction<ActivateThemeStep> = ( step: ActivateThemeStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
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

activateTheme.description = 'Activate an already installed theme.';
activateTheme.hidden = true;
activateTheme.vars = [
	{
		name: 'themeFolderName',
		description: 'The theme folder name in wp-content/themes/',
		required: true
	}
];
