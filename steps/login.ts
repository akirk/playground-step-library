import type { StepFunction, LoginStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';


export const login: StepFunction<LoginStep> = (step: LoginStep): StepResult => {
	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				steps: [
					{
						"step": "login",
						"username": step.username,
						"password": step.password
					}
				]
			};
			if (step.landingPage) {
				result.landingPage = '/wp-admin/';
			}
			return result;
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
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