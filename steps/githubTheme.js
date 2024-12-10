customSteps.githubTheme = function( step ) {
	const urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec( step.vars.url );
	if ( ! urlTest ) {
		return [];
	}
	const repo = urlTest.groups.org + "/" + urlTest.groups.repo;
	const branch = urlTest.groups.branch || "main";
	if ( ! /^[a-z0-9-]+$/.test( branch ) ) {
		return [];
	}
	let url = `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`;
	const directory = ( urlTest.groups.directory || "" ).replace( /\/+$/, '' ).replace( /^\/+/, '' );
	let dirBasename;
	if ( directory ) {
		url += '&directory=' + directory;
		dirBasename = directory.split( '/' ).pop();
	}
	const outStep = {
		"step": "installTheme",
		"themeData": {
			"resource": "url",
			url
		},
		options: {
			activate: true,
		}
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
	if ( directory && directory !== dirBasename ) {
		// if its a subsub directory, move the lowest directory into wp-content/themes
		outSteps[0].options.activate = false;
		outSteps.push({
			"step": "mv",
			"fromPath": "/wordpress/wp-content/themes/" + directory,
			"toPath": "/wordpress/wp-content/themes/" + dirBasename
		});
		outSteps.push({
			"step": "activateTheme",
			"themeFolderName": dirBasename
		});
	}
	return outSteps;
};
customSteps.githubTheme.info = "Install a theme from a Github repository.";
customSteps.githubTheme.vars = [
{
	"name": "url",
	"description": "Github URL of the theme.",
	"samples": [ "https://github.com/richtabor/kanso", "ndiego/nautilus", "https://github.com/Automattic/themes/tree/trunk/aether" ]
},
{
	"name": "prs",
	"description": "Add support for submitting Github Requests.",
	"type": "boolean",
	"samples": [ "false", "true" ]
}
];
