import type { StepFunction, EnableMultisiteStep , StepResult, V2SchemaFragments } from './types.js';

export const enableMultisite: StepFunction<EnableMultisiteStep> = (step: EnableMultisiteStep): StepResult => {
	return {
		toV1() {
	const steps = [
		{
			"step": "enableMultisite"
		}
	];
	(steps as any).landingPage = '/wp-admin/network/sites.php';
	return steps;
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
			};
		}
	};
};

enableMultisite.description = "Enable WordPress Multisite functionality.";
enableMultisite.builtin = true;
enableMultisite.vars = [];