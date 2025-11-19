import type { StepFunction, ChangeAdminColorSchemeStep, StepResult, V2SchemaFragments } from './types.js';


export const changeAdminColorScheme: StepFunction<ChangeAdminColorSchemeStep> = (step: ChangeAdminColorSchemeStep): StepResult => {
	return {
		toV1() {
	return [
		{
			"step": "updateUserMeta",
			"meta": {
				"admin_color": step.colorScheme
			},
			"userId": 1
		}
	];
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