import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface WordPressInstallationOptions {
	adminUsername?: string;
	adminPassword?: string;
}

export interface RunWpInstallationWizardStep extends BlueprintStep {
	options: WordPressInstallationOptions;
}

export const runWpInstallationWizard: StepFunction<RunWpInstallationWizardStep> = ( step: RunWpInstallationWizardStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'runWpInstallationWizard',
						options: step.options
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

runWpInstallationWizard.description = 'Installs WordPress.';
runWpInstallationWizard.hidden = true;
runWpInstallationWizard.vars = [
	{
		name: 'options',
		description: 'Installation options (adminUsername, adminPassword)',
		required: true
	}
];
