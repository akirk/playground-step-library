import type { StepFunction, RunWpCliCommandStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';


export const runWpCliCommand: StepFunction<RunWpCliCommandStep> = (step: RunWpCliCommandStep): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'wp-cli',
						command: step.command
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

runWpCliCommand.description = "Run a wp-cli command.";
runWpCliCommand.vars = [
	{
		name: "command",
		description: "The wp-cli command to run",
		required: true,
		samples: [""]
	}
];