import type { StepFunction, ChangeAdminColorSchemeStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const changeAdminColorScheme: StepFunction<ChangeAdminColorSchemeStep> = (step: ChangeAdminColorSchemeStep): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: "updateUserMeta",
						meta: {
							admin_color: step.colorScheme
						},
						userId: 1
					}
				]
			};
		},

		toV2() {
			// V2 users array is for creating new users, not updating existing ones
			// So we fall back to v1 updateUserMeta step
			return v1ToV2Fallback(this.toV1());
		}
	};
};

changeAdminColorScheme.description = "Useful to combine with a login step.";
changeAdminColorScheme.vars = [
	{
		name: "colorScheme",
		description: "Color scheme",
		required: true,
		samples: [
			'modern',
			'light',
			'fresh',
			'blue',
			'coffee',
			'ectoplasm',
			'midnight',
			'ocean',
			'sunrise'
		]
	}
];