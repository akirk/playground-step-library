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

	const outStep = {
		"step": "installPlugin",
		"pluginZipFile": {
			"resource": "url",
			"url": `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`
		},
		options
	};
	if ( step.vars.prs ) {
		outStep.queryParams = {
			'gh-ensure-auth': 'yes',
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'plugin',
			'ghexport-plugin': repoTest[2],
			'ghexport-playground-root': '/wordpress/wp-content/plugins/' + repoTest[2],
			'ghexport-pr-action': 'create',
			'ghexport-allow-include-zip': 'no',
		};
	}

	return [ outStep ];
};
customSteps.githubPlugin.info = "Install a plugin from a Githun repository.";
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
	},
	{
		"name": "prs",
		"description": "Add support for submitting Github Requests.",
		"type": "boolean",
		"samples": [ "false", "true" ]
	}
];
