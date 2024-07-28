customSteps.githubTheme = function( step ) {
	const repoTest = /(?:https:\/\/github.com\/)?((?:[^\/]+)\/([^\/]+))/.exec( step.vars.repo );
	if ( ! repoTest ) {
		return [];
	}
	const repo = repoTest[1];
	const branch = step.vars.branch || "main";
	const options = {
		activate: true,
	};
	return [
		{
			"step": "installTheme",
			"themeZipFile": {
				"resource": "url",
				"url": `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`
			},
			options
		}
	];
};
customSteps.githubTheme.info = "Install a theme from a Githun repository.";
customSteps.githubTheme.vars = [
	{
		"name": "repo",
		"description": "The theme resides in this GitHub repository.",
		"samples": [ "richtabor/kanso", "ndiego/nautilus" ]
	},
	{
		"name": "branch",
		"description": "Which branch to use.",
		"samples": [ "main" ]
	}
];
