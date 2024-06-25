customSteps.createUser = function( step ) {
	let code = "<?php require_once 'wordpress/wp-load.php';";
	let username = step?.vars?.username;
	let password = step?.vars?.password;
	let role = step?.vars?.role;
	let display_name = step?.vars?.display_name;
	let email = step?.vars?.email;
	if ( ! username || ! password || ! role ) {
		return [];
	}
	code += ` $data = array( 'user_login' => '${username}', 'user_pass' => '${password}', 'role' => '${role}',`
	if ( display_name ) {
		code += ` 'display_name' => '${display_name}',`;
	}

	if ( email ) {
		code += ` 'user_email' => '${email}',`;
	}

	code += "); wp_insert_user( $data ); ?>";
	var steps = [
		{
            "step": "runPHP",
            code
		}
	];
	if ( step?.vars?.login ) {
		steps.push( {
			"step": "login",
			"username": username,
			"password": password

		} );
	}
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
	},
	{
		"name": "email",
		"description": "E-Mail",
		"samples": [ '', "m@mullenweg.com" ]
	},
	{
		"name": "login",
		"description": "Immediately log the user in",
		'type': 'boolean'
	}
];
