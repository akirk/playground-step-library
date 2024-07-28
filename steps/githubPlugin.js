customSteps.githubPlugin = function( step ) {
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
			"step": "installPlugin",
			"pluginZipFile": {
				"resource": "url",
				"url": `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`
			},
			options
		}
	];
};
customSteps.githubTheme.info = "Install a plugin from a Githun repository.";
customSteps.githubPlugin.vars = [
	{
		"name": "repo",
		"description": "The plugin resides in this GitHub repository.",
		"samples": [ "akirk/blueprint-recorder" ]
	},
	{
		"name": "branch",
		"description": "Which branch to use.",
		"samples": [ "main" ]
	}
];
