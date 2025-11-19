import type { StepFunction, SetSiteOptionStep, StepResult, V2SchemaFragments } from './types.js';


export const setSiteOption: StepFunction<SetSiteOptionStep> = (step: SetSiteOptionStep): StepResult => {
	return {
		toV1() {
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

setSiteOption.description = "Set a site option.";
setSiteOption.builtin = true;
setSiteOption.multiple = true;
setSiteOption.vars = [
	{
		name: "name",
		description: "Option name",
		samples: [ "","permalink_structure" ]
	},
	{
		name: "value",
		description: "Option value",
		samples: [ "", "/%postname%/" ]
	}
];