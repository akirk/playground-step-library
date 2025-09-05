import type { StepFunction, SetSiteOptionStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const setSiteOption: StepFunction<SetSiteOptionStep> = (step: SetSiteOptionStep) => {
	if ( ! step.name ) {
		return [];
	}
	const optionStep = {
		"step": "setSiteOptions",
		"options": {} as Record<string, any>
	};
	if ( Array.isArray( step.name ) ) {
		step.name.forEach( ( name, index ) => {
			if ( ! name ) {
				return;
			}
			optionStep.options[name] = Array.isArray(step.value) ? step.value[index] : step.value;
		} );
	} else {
		optionStep.options[step.name] = step.value;
	}
	return [ optionStep ];
};

setSiteOption.description = "Set a site option.";
setSiteOption.builtin = true;
setSiteOption.multiple = true;
setSiteOption.vars = createVarsConfig({
	name: {
		description: "Option name",
		samples: [ "","permalink_structure" ]
	},
	value: {
		description: "Option value",
		samples: [ "", "/%postname%/" ]
	}
});