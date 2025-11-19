import type { StepFunction, RunPHPStep, StepResult, V2SchemaFragments } from './types.js';


export const runPHP: StepFunction<RunPHPStep> = (step: RunPHPStep): StepResult => {
	return {
		toV1() {
	return [
		{
			"step": "runPHP",
			code: step.code
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

runPHP.description = "Run code in the context of WordPress.";
runPHP.builtin = true;
runPHP.vars = [
	{
		name: "code",
		description: "The code to run",
		type: "textarea",
		language: "php",
		required: true,
		samples: [
		"<?php require_once '/wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress",
		"<?php error_log( 'Debug message from WordPress Playground' );"
		]
	}
];