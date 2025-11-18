import type { StepFunction, RunWpCliCommandStep} from './types.js';


export const runWpCliCommand: StepFunction<RunWpCliCommandStep> = (step: RunWpCliCommandStep) => {
	return [
		{
			step: 'wp-cli',
			command: step.command
		}
	];
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