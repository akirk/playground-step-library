customSteps.githubTheme = function( step ) {
	const repoTest = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/.exec( step.vars.repo );
	if ( ! repoTest ) {
		return [];
	}
	const repo = repoTest[1] + "/" + repoTest[2];
	const branch = step.vars.branch || "main";
	if ( ! /^[a-z0-9-]+$/.test( branch ) ) {
		return [];
	}
        const directory = step.vars.directory || "";
	const options = {
		activate: true,
	};

	const outStep = {
		"step": "installTheme",
		"themeZipFile": {
			"resource": "url",
			"url": `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`
		},
		options
	};
	if ( step.vars.prs ) {
		outStep.queryParams = {
			'gh-ensure-auth': 'yes',
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'theme',
			'ghexport-theme': repoTest[2] + '-' + branch,
			'ghexport-playground-root': '/wordpress/wp-content/themes/' + repoTest[2] + '-' + branch,
			'ghexport-pr-action': 'create',
			'ghexport-allow-include-zip': 'no',
		};
	}
        const outSteps = [ outStep ];
        if ( directory ) {
                // if its a subsub directory, move the lowest directory into wp-content/themes
                const dirBasename = directory.split( '/' ).pop();
                outSteps.push({
                        "step": "mv",
                        "fromPath": "/wordpress/wp-content/themes/" + directory,
                        "toPath": "/wordpress/wp-content/themes/" + dirBasename
                });
                outSteps.push({
                        "step": "activateTheme",
                        "themePath": "/wordpress/wp-content/themes/" + dirBasename
                });
        }
	return outSteps;
};
customSteps.githubTheme.info = "Install a theme from a Github repository.";
customSteps.githubTheme.vars = [
	{
		"name": "repo",
		"description": "The theme resides in this GitHub repository.",
		"samples": [ "richtabor/kanso", "ndiego/nautilus" ]
	},
	{
		"name": "branch",
		"description": "Which branch to use.",
		"samples": [ "main", "trunk" ]
	},
        {
                "name": "directory",
                "description": "Which subdirectory to use.",
                "samples": [ "" ]
        },
	{
		"name": "prs",
		"description": "Add support for submitting Github Requests.",
		"type": "boolean",
		"samples": [ "false", "true" ]
	}
];
