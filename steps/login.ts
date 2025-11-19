import type { StepFunction, LoginStep , StepResult, V2SchemaFragments } from './types.js';


export const login: StepFunction<LoginStep> = (step: LoginStep): StepResult => {
	return {
		toV1() {
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