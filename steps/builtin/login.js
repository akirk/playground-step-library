export function login( step ) {
	const steps = [
		{
			"step": "login",
			"username": "${username}",
			"password": "${password}"
		}
	];
	if ( step.vars.landingPage ) {
		steps.landingPage ='/wp-admin/';
	}
	return steps;
}
login.description = "Login to the site";
login.builtin = true;
login.vars = [
	{
		"name": "username",
		"description": "Username",
		"required": true,
		"samples": [ "admin" ]
	},
	{
		"name": "password",
		"description": "Password",
		"required": true,
		"samples": [ "password" ]
	},
	{
		"name": "landingPage",
		"description": "Change landing page to wp-admin",
		"type": "boolean",
		"samples": [ "true", "false" ]
	}
];
