import type { StepFunction, LoginStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const login: StepFunction<LoginStep> = (step: LoginStep) => {
	const steps = [
		{
			"step": "login",
			"username": step.username,
			"password": step.password
		}
	];
	if ( step.landingPage ) {
		(steps as any).landingPage ='/wp-admin/';
	}
	return steps;
};

login.description = "Login to the site";
login.builtin = true;
login.vars = createVarsConfig({
	username: {
		description: "Username",
		required: true,
		samples: [ "admin" ]
	},
	password: {
		description: "Password",
		required: true,
		samples: [ "password" ]
	},
	landingPage: {
		description: "Change landing page to wp-admin",
		type: "boolean",
		samples: [ "true", "false" ]
	}
});