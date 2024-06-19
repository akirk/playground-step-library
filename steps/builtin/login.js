customSteps.login = function() {
	var steps = [
		{
			"step": "login",
			"username": "${username}",
			"password": "${password}"
		}
	];
	steps.landingPage ='/wp-admin/?welcome=0';
	return steps;
}
customSteps.login.description = "Login to the site";
customSteps.login.builtin = true;
customSteps.login.vars = [
	{
		"name": "username",
		"description": "Username",
		"required": true,
		"sample": "admin"
	},
	{
		"name": "password",
		"description": "Password",
		"required": true,
		"sample": "password"
	}
];
