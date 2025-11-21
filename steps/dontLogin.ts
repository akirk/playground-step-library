import type { StepFunction, DontLoginStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';

export const dontLogin: StepFunction<DontLoginStep> = (step: DontLoginStep): StepResult => {
	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				login: false
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				applicationOptions: {
					'wordpress-playground': {
						login: false
					}
				}
			};
			return result;
		}
	};
};

dontLogin.description = "Prevent automatic login (Playground logs in as admin by default).";
dontLogin.vars = [];
