import type { StepFunction, DontLoginStep } from './types.js';


export const dontLogin: StepFunction<DontLoginStep> = (step: DontLoginStep) => {
	const steps: any = [];
	steps.login = false;
	return steps;
};

dontLogin.description = "Prevent automatic login (Playground logs in as admin by default).";
dontLogin.vars = [];
