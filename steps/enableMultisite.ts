import type { StepFunction, EnableMultisiteStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const enableMultisite: StepFunction<EnableMultisiteStep> = (step: EnableMultisiteStep): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: "enableMultisite"
					}
				],
				landingPage: '/wp-admin/network/sites.php'
			};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

enableMultisite.description = "Enable WordPress Multisite functionality.";
enableMultisite.builtin = true;
enableMultisite.vars = [];