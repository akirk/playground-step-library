import type { StepFunction, DefineWpConfigConstStep, StepResult, V2SchemaFragments } from './types.js';


export const defineWpConfigConst: StepFunction<DefineWpConfigConstStep> = (step: DefineWpConfigConstStep): StepResult => {
	return {
		toV1() {
	if ( ! step.name ) {
		return [];
	}
	const constStep = {
		"step": "defineWpConfigConsts",
		"consts": {} as Record<string, any>
	};
	if ( Array.isArray( step.name ) ) {
		step.name.forEach( ( name, index ) => {
			if ( ! name ) {
				return;
			}
			const values = Array.isArray(step.value) ? step.value : [step.value];
			const value = values[index];
			if ( value === 'true' ) {
				constStep.consts[name] = true;
			} else if ( value === 'false' ) {
				constStep.consts[name] = false;
			} else {
				constStep.consts[name] = value;
			}
		} );
	} else {
		constStep.consts[step.name] = step.value;
	}
	return [ constStep ];
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

defineWpConfigConst.description = "Define a wp-config PHP constant.";
defineWpConfigConst.builtin = true;
defineWpConfigConst.multiple = true;
defineWpConfigConst.vars = [
	{
		name: "name",
		description: "Constant name",
		samples: [ "WP_DEBUG" ]
	},
	{
		name: "value",
		description: "Constant value",
		samples: [ "true" ]
	}
];