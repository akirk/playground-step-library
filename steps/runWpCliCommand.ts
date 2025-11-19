import type { StepFunction, RunWpCliCommandStep, StepResult, V2SchemaFragments } from './types.js';


export const runWpCliCommand: StepFunction<RunWpCliCommandStep> = (step: RunWpCliCommandStep): StepResult => {
	return {
		toV1() {
	return [
		{
			step: 'wp-cli',
			command: step.command
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

runWpCliCommand.description = "Run a wp-cli command.";
runWpCliCommand.vars = [
	{
		name: "command",
		description: "The wp-cli command to run",
		required: true,
		samples: [""]
	}
];