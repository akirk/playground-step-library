import type { StepFunction, SetLandingPageStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const setLandingPage: StepFunction<SetLandingPageStep> = (step: SetLandingPageStep) => {
	const steps: any = [];
	steps.landingPage = step.landingPage;
	return steps;
};

setLandingPage.description = "Set the landing page.";
setLandingPage.vars = createVarsConfig({
	landingPage: {
		description: "The relative URL for the landing page",
		required: true,
		samples: [ "/", "/wp-admin/", "/wp-admin/post-new.php", "/wp-admin/post-new.php?post_type=page" ]
	}
});