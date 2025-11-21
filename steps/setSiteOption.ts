import type { StepFunction, SetSiteOptionStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const setSiteOption: StepFunction<SetSiteOptionStep> = (step: SetSiteOptionStep): StepResult => {
	// Parse once - handle both array and single values
	const names = Array.isArray( step.name ) ? step.name : [step.name];
	const values = Array.isArray( step.value ) ? step.value : [step.value];

	// Build options object
	const options: Record<string, any> = {};
	names.forEach( ( name, index ) => {
		if ( !name ) return;
		options[name] = values[index];
	} );

	// If no valid options, return empty blueprint
	if ( Object.keys( options ).length === 0 ) {
		return {
			toV1() {
				return { steps: [] };
			},
			toV2() {
				return { version: 2 };
			}
		};
	}

	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				steps: [{
					step: "setSiteOptions",
					options
				}]
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				siteOptions: options
			};
			return result;
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