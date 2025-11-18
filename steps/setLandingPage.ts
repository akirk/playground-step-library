import type { StepFunction, SetLandingPageStep} from './types.js';


export const setLandingPage: StepFunction<SetLandingPageStep> = (step: SetLandingPageStep) => {
	const steps: any = [];
	steps.landingPage = step.landingPage;
	return steps;
};

setLandingPage.description = "Set the landing page.";
setLandingPage.vars = [
	{
		name: "landingPage",
		description: "The relative URL for the landing page",
		required: true,
		samples: [ "/", "/wp-admin/", "/wp-admin/post-new.php", "/wp-admin/post-new.php?post_type=page" ]
	}
];