import type { StepFunction, EnableIntlStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const enableIntl: StepFunction<EnableIntlStep> = (step: EnableIntlStep): StepResult => {
	return {
		toV1() {
			return {
				steps: [],
				features: { intl: true }
			};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

enableIntl.description = "Enable PHP Intl extension support.";
enableIntl.vars = [];
