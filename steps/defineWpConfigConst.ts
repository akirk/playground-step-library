import type { StepFunction, DefineWpConfigConstStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { StepDefinition } from '@wp-playground/blueprints';


export const defineWpConfigConst: StepFunction<DefineWpConfigConstStep> = (step: DefineWpConfigConstStep): StepResult => {
	return {
		toV1() {
			if (!step.name) {
				return {};
			}
			const constStep: StepDefinition = {
				step: "defineWpConfigConsts",
				consts: {}
			};
			if (Array.isArray(step.name)) {
				step.name.forEach((name, index) => {
					if (!name) {
						return;
					}
					const values = Array.isArray(step.value) ? step.value : [step.value];
					const value = values[index];
					if (value === 'true') {
						constStep.consts[name] = true;
					} else if (value === 'false') {
						constStep.consts[name] = false;
					} else {
						constStep.consts[name] = value;
					}
				});
			} else {
				constStep.consts[step.name] = step.value;
			}
			return { steps: [constStep] };
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
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