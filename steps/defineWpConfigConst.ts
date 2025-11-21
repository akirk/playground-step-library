import type { StepFunction, DefineWpConfigConstStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const defineWpConfigConst: StepFunction<DefineWpConfigConstStep> = (step: DefineWpConfigConstStep): StepResult => {
	// Parse once - handle both array and single values
	const names = Array.isArray(step.name) ? step.name : [step.name];
	const values = Array.isArray(step.value) ? step.value : [step.value];

	// Build consts object
	const consts: Record<string, any> = {};
	names.forEach((name, index) => {
		if (!name) return;

		const value = values[index];
		// Convert string booleans to actual booleans
		if (value === 'true') {
			consts[name] = true;
		} else if (value === 'false') {
			consts[name] = false;
		} else {
			consts[name] = value;
		}
	});

	// If no valid consts, return empty blueprint
	if (Object.keys(consts).length === 0) {
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
					step: "defineWpConfigConsts",
					consts
				}]
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				constants: consts
			};
			return result;
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
		samples: ["WP_DEBUG"]
	},
	{
		name: "value",
		description: "Constant value",
		samples: ["true"]
	}
];