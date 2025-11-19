import type { StepFunction, DontLoginStep , StepResult, V2SchemaFragments } from './types.js';


export const dontLogin: StepFunction<DontLoginStep> = (step: DontLoginStep): StepResult => {
	return {
		toV1() {
	const steps: any = [];
	steps.login = false;
	return steps;
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

dontLogin.description = "Prevent automatic login (Playground logs in as admin by default).";
dontLogin.vars = [];
