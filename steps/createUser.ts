import type { StepFunction, CreateUserStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration, StepDefinition } from '@wp-playground/blueprints';

export const createUser: StepFunction<CreateUserStep> = (step: CreateUserStep): StepResult => {
	const username = step.vars?.username;
	const password = step.vars?.password;
	const role = step.vars?.role;
	const display_name = step.vars?.display_name;
	const email = step.vars?.email;

	return {
		toV1() {
			if (!username || !password || !role) {
				return {};
			}

			let code = "<?php require_once '/wordpress/wp-load.php';";
			code += ` $data = array( 'user_login' => '${username}', 'user_pass' => '${password}', 'role' => '${role}',`;

			if (display_name) {
				code += ` 'display_name' => '${display_name}',`;
			}

			if (email) {
				code += ` 'user_email' => '${email}',`;
			}

			code += "); wp_insert_user( $data ); ?>";

			const result: BlueprintV1Declaration = {
				steps: [
					{
						step: "runPHP",
						code,
						progress: {
							caption: `createUser: ${username}`
						}
					}
				]
			};

			if (step.vars?.login) {
				result.steps!.push( { step: "login", vars: { username: username,
					password: password } } );
				result.landingPage = '/wp-admin/';
			}

			return result;
		},

		toV2() {
			if (!username || !role) {
				return { version: 2 };
			}

			const result: BlueprintV2Declaration = {
				version: 2,
				users: [{
					username: username,
					email: email || `${username}@example.com`,
					role: role,
					meta: display_name ? { display_name } : {}
				}]
			};

			// Set password via PHP (v2 users don't support passwords directly)
			if (password) {
				(result as any).additionalStepsAfterExecution = [{
					step: 'runPHP',
					code: `<?php
require_once '/wordpress/wp-load.php';
$user = get_user_by( 'login', '${username}' );
if ( $user ) {
	wp_set_password( '${password}', $user->ID );
}`
				}];
			}

			// Login if requested - use applicationOptions for v2
			if (step.vars?.login) {
				const isDefault = username === 'admin' && password === 'password';
				result.applicationOptions = {
					'wordpress-playground': {
						login: isDefault ? true : {
							username: username,
							password: password
						}
					}
				};
			}

			return result;
		}
	};
};

createUser.description = "Create a new user.";
createUser.vars = [
	{
		name: "username",
		description: "Username",
		required: true,
		samples: ["user"]
	},
	{
		name: "password",
		description: "Password",
		required: true,
		samples: ["password"]
	},
	{
		name: "role",
		description: "Role",
		required: true,
		type: "text",
		samples: ["administrator", "editor", "read", "client"]
	},
	{
		name: "display_name",
		description: "Display Name",
		samples: ["User"]
	},
	{
		name: "email",
		description: "E-Mail",
		samples: ['', "wordpress@example.org"]
	},
	{
		name: "login",
		description: "Immediately log the user in",
		type: 'boolean',
		samples: ['true']
	}
];