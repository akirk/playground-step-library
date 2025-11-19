import type { StepFunction, SetLandingPageStep, StepResult, V2SchemaFragments } from './types.js';


export const setLandingPage: StepFunction<SetLandingPageStep> = (step: SetLandingPageStep): StepResult => {
	return {
		toV1() {
	const steps: any = [];
	steps.landingPage = step.landingPage;
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

setLandingPage.description = "Set the landing page.";
setLandingPage.vars = [
	{
		name: "landingPage",
		description: "The relative URL for the landing page",
		required: true,
		samples: [ "/", "/wp-admin/", "/wp-admin/post-new.php", "/wp-admin/post-new.php?post_type=page" ]
	}
];