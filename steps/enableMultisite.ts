import type { StepFunction, EnableMultisiteStep } from './types.js';

export const enableMultisite: StepFunction<EnableMultisiteStep> = (step: EnableMultisiteStep) => {
	const steps = [
		{
			"step": "enableMultisite"
		}
	];
	(steps as any).landingPage = '/wp-admin/network/sites.php';
	return steps;
};

enableMultisite.description = "Enable WordPress Multisite functionality.";
enableMultisite.builtin = true;
enableMultisite.vars = [];