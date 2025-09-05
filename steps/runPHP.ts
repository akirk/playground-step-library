import type { StepFunction, RunPHPStep} from './types.js';


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
runPHP.vars = Object.entries({
	code: {
		description: "The code to run",
		type: "textarea",
		required: true,
		samples: [""]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));