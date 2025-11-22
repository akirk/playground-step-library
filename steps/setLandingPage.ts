import type { StepFunction, SetLandingPageStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const setLandingPage: StepFunction<SetLandingPageStep> = (step: SetLandingPageStep): StepResult => {
	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				landingPage: step.vars?.landingPage,
				steps: []
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				applicationOptions: {
					'wordpress-playground': {
						landingPage: step.vars?.landingPage
					}
				}
			};
			return result;
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