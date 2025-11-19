import type { StepFunction, CreateUserStep, StepResult, V2SchemaFragments } from './types.js';


export const createUser: StepFunction<CreateUserStep> = (step: CreateUserStep): StepResult => {
	const username = step.username;
	const password = step.password;
	const role = step.role;
	const display_name = step.display_name;
	const email = step.email;

	return {
		toV1() {
			if (!username || !password || !role) {
				return [];
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

			const steps: any[] = [
				{
					step: "runPHP",
					code,
					progress: {
						caption: `createUser: ${username}`
					}
				}
			];

			if (step.login) {
				steps.push({
					step: "login",
					username: username,
					password: password
				});
				(steps as any).landingPage = '/wp-admin/';
			}

			return steps;
		},

		toV2(): V2SchemaFragments {
			if (!username || !role) {
				return {};
			}

			const fragments: V2SchemaFragments = {};

			// V2 users array (note: no password in v2 schema)
			const userData: any = {
				username: username,
				email: email || `${username}@example.com`,
				role: role
			};

			if (display_name) {
				userData.meta = { display_name };
			}

			fragments.users = [userData];

			// Password and login must be handled in additionalSteps
			if (password || step.login) {
				fragments.additionalSteps = [];

				// Set password via PHP (v2 users don't support passwords directly)
				if (password) {
					fragments.additionalSteps.push({
						step: 'runPHP',
						code: `<?php
require_once '/wordpress/wp-load.php';
$user = get_user_by( 'login', '${username}' );
if ( $user ) {
	wp_set_password( '${password}', $user->ID );
}`
					});
				}

				// Login if requested
				if (step.login) {
					fragments.additionalSteps.push({
						step: 'login',
						username: username,
						password: password
					});
				}
			}

			return fragments;
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