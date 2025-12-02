import type { StepFunction, RunPHPStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';


export const runPHP: StepFunction<RunPHPStep> = (step: RunPHPStep): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: "runPHP" as const,
						code: step.vars?.code || ''
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
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