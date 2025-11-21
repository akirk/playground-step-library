import type { StepFunction, SetSiteNameStep, StepResult } from './types.js';
import { setSiteOption } from './setSiteOption.js';


export const setSiteName: StepFunction<SetSiteNameStep> = (step: SetSiteNameStep): StepResult => {
	return setSiteOption({
		step: 'setSiteOption',
		name: ['blogname', 'blogdescription'],
		value: ['${sitename}', '${tagline}']
	});
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