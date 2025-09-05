import type { StepFunction, RunWpCliCommandStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const runWpCliCommand: StepFunction<RunWpCliCommandStep> = (step: RunWpCliCommandStep) => {
	return [
		{
			step: 'wp-cli',
			command: step.command
		}
	];
};

runWpCliCommand.description = "Run a wp-cli command.";
runWpCliCommand.vars = createVarsConfig({
	command: {
		description: "The wp-cli command to run",
		required: true,
		samples: [""]
	}
});