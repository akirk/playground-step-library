customSteps.createUser = function() {
	var steps = [
		{
            "step": "runPHP",
            "code": "<?php require_once 'wordpress/wp-load.php'; $data = array( 'user_login' => '${username}', 'user_pass' => '${password}', 'role' => '${role}' ); wp_insert_user( $data ); ?>"
		}
	];
	return steps;
}
customSteps.createUser.description = "Create a user";
customSteps.createUser.vars = [
	{
		"name": "username",
		"description": "Username",
		"required": true,
		"sample": "akirk"
	},
	{
		"name": "password",
		"description": "Password",
		"required": true,
		"sample": "password"
	},
	{
		"name": "role",
		"description": "Role",
		"required": true,
		"sample": "administrator"
	}
];
