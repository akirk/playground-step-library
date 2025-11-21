import type { StepFunction, DoActionStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const doAction: StepFunction<DoActionStep> = (step: DoActionStep): StepResult => {
	if (!step?.action) {
		return {
			toV1() {
				return { steps: [] };
			},
			toV2() {
				return { version: 2 };
			}
		};
	}

	const params = [''];
	for (let i = 1; i <= 5; i++) {
		const paramKey = `parameter${i}` as keyof DoActionStep;
		if (step[paramKey]) {
			params.push("'" + step[paramKey] + "'");
		}
	}

	const code = "<?php do_action( '" + step.action + "'" + params.join(',') + " ); ?>";

	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				steps: [
					{
						step: "runPHP",
						code,
						progress: {
							caption: `doAction: ${step.action}`
						}
					}
				]
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				steps: [
					{
						step: "runPHP",
						code
					}
				]
			};
			return result;
		}
	};
};

doAction.description = "Execute a custom action.";
doAction.vars = [
	{
		name: "action",
		description: "Execute a custom action.",
		type: "text",
		required: true,
		samples: [""]
	},
	{
		name: "parameter1",
		description: "First parameter for the action.",
		type: "text",
		required: false,
		samples: [""]
	},
	{
		name: "parameter2",
		description: "Second parameter for the action.",
		type: "text",
		required: false,
		samples: [""]
	},
	{
		name: "parameter3",
		description: "Third parameter for the action.",
		type: "text",
		required: false,
		samples: [""]
	},
	{
		name: "parameter4",
		description: "Fourth parameter for the action.",
		type: "text",
		required: false,
		samples: [""]
	},
	{
		name: "parameter5",
		description: "Fifth parameter for the action.",
		type: "text",
		required: false,
		samples: [""]
	}
];