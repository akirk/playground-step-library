customSteps.githubPluginRelease = function( step ) {
	const repoTest = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/.exec( step.vars.repo );
	if ( ! repoTest ) {
		return [];
	}
	const repo = repoTest[1] + "/" + repoTest[2];
	const tag = step.vars.release;
	const filename = step.vars.filename;
	const options = {
		activate: true,
	};

	const outStep = {
		"step": "installPlugin",
		"pluginZipFile": {
			"resource": "url",
			"url": `https://github-proxy.com/proxy/?repo=${repo}&release=${tag}&asset=${filename}`
		},
		options
	};


	return [ outStep ];
};
customSteps.githubPluginRelease.info = "Install a specific plugin release from a Github repository.";
customSteps.githubPluginRelease.vars = [
	{
		"name": "repo",
		"description": "The plugin resides in this GitHub repository.",
		"samples": [ "ryanwelcher/interactivity-api-todomvc" ]
	},
	{
		"name": "release",
		"description": "The release slug.",
		"samples": [ "v0.1.3" ]
	},
	{
		"name": "filename",
		"description": "Which filename to use.",
		"samples": [ " to-do-mvc.zip " ]
	}
];
