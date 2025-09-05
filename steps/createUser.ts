import type { StepFunction, CreateUserStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

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
			code
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
createUser.vars = createVarsConfig({
	username: {
		description: "Username",
		required: true,
		samples: ["user"]
	},
	password: {
		description: "Password",
		required: true,
		samples: ["password"]
	},
	role: {
		description: "Role",
		required: true,
		type: "text",
		samples: ["administrator", "editor", "read", "client"]
	},
	display_name: {
		description: "Display Name",
		samples: ["User"]
	},
	email: {
		description: "E-Mail",
		samples: ['', "wordpress@example.org"]
	},
	login: {
		description: "Immediately log the user in",
		type: 'boolean',
		samples: ['true']
	}
});