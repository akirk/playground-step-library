customSteps.login = function( step ) {
	var steps = [
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
customSteps.login.description = "Login to the site";
customSteps.login.builtin = true;
customSteps.login.vars = [
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
