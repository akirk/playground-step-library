import type { StepFunction, LoginStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const login: StepFunction<LoginStep> = (step: LoginStep): StepResult => {
	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				steps: [
					{
						"step": "login",
						"username": step.vars?.username,
						"password": step.vars?.password
					}
				]
			};
			if (step.vars?.landingPage) {
				result.landingPage = '/wp-admin/';
			}
			return result;
		},

		toV2() {
			const username = step.vars?.username || 'admin';
			const password = step.vars?.password || 'password';
			const isDefault = username === 'admin' && password === 'password';
			const result: BlueprintV2Declaration = {
				version: 2,
				applicationOptions: {
					'wordpress-playground': {
						login: isDefault ? true : {
							username: username,
							password: password
						}
					}
				}
			};
			if (step.vars?.landingPage) {
				result.applicationOptions!['wordpress-playground'].landingPage = '/wp-admin/';
			}
			return result;
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
		samples: ["false", "true"]
	}
];