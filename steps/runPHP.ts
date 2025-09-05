import type { StepFunction, RunPHPStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const runPHP: StepFunction<RunPHPStep> = (step: RunPHPStep) => {
	return [
		{
			"step": "runPHP",
			code: step.code
		}
	];
};

runPHP.description = "Run code in the context of WordPress.";
runPHP.builtin = true;
runPHP.vars = createVarsConfig({
	code: {
		description: "The code to run",
		type: "textarea",
		required: true,
		samples: [""]
	}
});