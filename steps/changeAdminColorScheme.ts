import type { StepFunction, ChangeAdminColorSchemeStep} from './types.js';


export const changeAdminColorScheme: StepFunction<ChangeAdminColorSchemeStep> = (step: ChangeAdminColorSchemeStep) => {
	return [
		{
			"step": "updateUserMeta",
			"meta": {
				"admin_color": step.colorScheme
			},
			"userId": 1
		}
	];
};

changeAdminColorScheme.description = "Useful to combine with a login step.";
changeAdminColorScheme.vars = Object.entries({
	colorScheme: {
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
}).map(([name, varConfig]) => ({ name, ...varConfig }));