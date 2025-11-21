import type { StepFunction, DontLoginStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const dontLogin: StepFunction<DontLoginStep> = (step: DontLoginStep): StepResult => {
	return {
		toV1() {
			return {
				login: false
			};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

dontLogin.description = "Prevent automatic login (Playground logs in as admin by default).";
dontLogin.vars = [];
