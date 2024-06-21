customSteps.createUser = function( step ) {
	let code = "<?php require_once 'wordpress/wp-load.php';";
	let username = step?.vars?.username;
	let password = step?.vars?.password;
	let role = step?.vars?.role;
	let display_name = step?.vars?.display_name;
	if ( ! username || ! password || ! role ) {
		return [];
	}
	code += ` $data = array( 'user_login' => '${username}', 'user_pass' => '${password}', 'role' => '${role}',`
	if ( display_name ) {
		code += ` 'display_name' => '${display_name}',`;
	}

	code += "); wp_insert_user( $data ); ?>";
	var steps = [
		{
            "step": "runPHP",
            code
		}
	];
	return steps;
}
customSteps.createUser.vars = [
	{
		"name": "username",
		"description": "Username",
		"required": true,
		"samples": [ "matt" ]
	},
	{
		"name": "password",
		"description": "Password",
		"required": true,
		"samples": [ "password" ]
	},
	{
		"name": "role",
		"description": "Role",
		"required": true,
		"samples": [ "administrator" ]
	},
	{
		"name": "display_name",
		"description": "Display Name",
		"samples": [ "Matt" ]
	}
];
