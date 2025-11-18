import type { StepFunction, LoginStep } from './types.js';


export const login: StepFunction<LoginStep> = (step: LoginStep) => {
	const steps = [
		{
			"step": "login",
			"username": step.username,
			"password": step.password
		}
	];
	if (step.landingPage) {
		(steps as any).landingPage = '/wp-admin/';
	}
	return steps;
};

login.description = "Login to the site.";
login.builtin = true;
login.vars = [
	{
		name: "username",
		description: "Username",
		required: true,
		samples: ["admin"]
	},
	{
		name: "password",
		description: "Password",
		required: true,
		samples: ["password"]
	},
	{
		name: "landingPage",
		description: "Change landing page to wp-admin",
		type: "boolean",
		samples: ["true", "false"]
	}
];