import type { StepFunction, SetLandingPageStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';


export const setLandingPage: StepFunction<SetLandingPageStep> = (step: SetLandingPageStep): StepResult => {
	return {
		toV1() {
	const steps: any = [];
	steps.landingPage = step.landingPage;
	return steps;
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		};
	};
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