import type { StepFunction, CreateUserStep} from './types.js';


export const createUser: StepFunction<CreateUserStep> = (step: CreateUserStep) => {
	let code = "<?php require_once '/wordpress/wp-load.php';";
	const username = step.username;
	const password = step.password;
	const role = step.role;
	const display_name = step.display_name;
	const email = step.email;
	
	if (!username || !password || !role) {
		return [];
	}
	
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
			"step": "runPHP",
			code,
			"progress": {
				"caption": `createUser: ${username}`
			}
		}
	];
	
	if (step.login) {
		steps.push({
			"step": "login",
			"username": username,
			"password": password
		});
		(steps as any).landingPage = '/wp-admin/';
	}
	
	return steps;
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