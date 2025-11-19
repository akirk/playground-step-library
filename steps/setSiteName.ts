import type { StepFunction, SetSiteNameStep, StepResult, V2SchemaFragments } from './types.js';


export const setSiteName: StepFunction<SetSiteNameStep> = (step: SetSiteNameStep): StepResult => {
	return {
		toV1() {
	return [
		{
			"step": "setSiteOptions",
			"options": {
				"blogname": "${sitename}",
				"blogdescription": "${tagline}",
			}
		}
	];
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

setSiteName.description = "Set the site name and tagline.";
setSiteName.vars = [
	{
		name: "sitename",
		description: "Name of the site",
		required: true,
		samples: ["Step Library Demo"]
	},
	{
		name: "tagline",
		description: "What the site is about",
		required: true,
		samples: ["Trying out WordPress Playground."]
	}
];