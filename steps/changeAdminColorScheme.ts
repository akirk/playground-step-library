import type { StepFunction, ChangeAdminColorSchemeStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

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
changeAdminColorScheme.vars = createVarsConfig({
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
});