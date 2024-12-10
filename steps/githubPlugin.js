customSteps.githubPlugin = function( step ) {
	const urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec( step.vars.url );
	if ( ! urlTest ) {
		return [];
	}
	const repo = urlTest.groups.org + "/" + urlTest.groups.repo;
	const branch = urlTest.groups.branch || "main";
	if ( ! /^[a-z0-9-]+$/.test( branch ) ) {
		return [];
	}
	const directory = urlTest.groups.directory || "";
	const options = {
		activate: true,
	};
	let url = `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`;
	if ( directory ) {
		url += '&directory=' + directory.replace( /\/+$/, '' ).replace( /^\/+/, '' );
		options.activate = false;
	}

	const outStep = {
		"step": "installPlugin",
		"pluginData": {
			"resource": "url",
			url
		},
		options
	};

	if ( step.vars.prs ) {
		outStep.queryParams = {
			'gh-ensure-auth': 'yes',
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'plugin',
			'ghexport-plugin': repoTest[2] + '-' + branch,
			'ghexport-playground-root': '/wordpress/wp-content/plugins/' + repoTest[2] + '-' + branch,
			'ghexport-pr-action': 'create',
			'ghexport-allow-include-zip': 'no',
		};
	}

	const outSteps = [ outStep ];
	if ( directory ) {
		// if its a subsub directory, move the lowest directory into wp-content/plugins
		const dirBasename = directory.split( '/' ).pop();
		outSteps.push({
			"step": "mv",
			"fromPath": "/wordpress/wp-content/plugins/" + directory,
			"toPath": "/wordpress/wp-content/plugins/" + dirBasename
		});
		outSteps.push({
			"step": "activatePlugin",
			"pluginPath": "/wordpress/wp-content/plugins/" + dirBasename
		});
	}


	return outSteps;
};
customSteps.githubPlugin.info = "Install a plugin from a Github repository.";
customSteps.githubPlugin.vars = [
	{
		"name": "url",
		"description": "Github URL of the plugin.",
		"samples": [ "https://github.com/akirk/blueprint-recorder" ]
	},
	{
		"name": "prs",
		"description": "Add support for submitting Github Requests.",
		"type": "boolean",
		"samples": [ "false", "true" ]
	}
];
