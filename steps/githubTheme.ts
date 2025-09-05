import type { StepFunction, GithubThemeStep} from './types.js';


export const githubTheme: StepFunction<GithubThemeStep> = (step: GithubThemeStep) => {
	const urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec( step.url );
	if ( ! urlTest ) {
		return [];
	}
	const repo = urlTest.groups!.org + "/" + urlTest.groups!.repo;
	const branch = urlTest.groups!.branch || "main";
	if ( ! /^[a-z0-9-]+$/.test( branch ) ) {
		return [];
	}
	let url = `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`;
	const directory = ( urlTest.groups!.directory || "" ).replace( /\/+$/, '' ).replace( /^\/+/, '' );
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
	} as any;

	if ( step.prs ) {
		outStep.queryParams = {
			'gh-ensure-auth': 'yes',
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'theme',
			'ghexport-theme': urlTest.groups!.repo + '-' + branch,
			'ghexport-playground-root': '/wordpress/wp-content/themes/' + urlTest.groups!.repo + '-' + branch,
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

githubTheme.description = "Install a theme from a Github repository.";
githubTheme.vars = Object.entries({
	url: {
		description: "Github URL of the theme.",
		samples: [ "https://github.com/richtabor/kanso", "ndiego/nautilus", "https://github.com/Automattic/themes/tree/trunk/aether" ]
	},
	prs: {
		description: "Add support for submitting Github Requests.",
		type: "boolean",
		samples: [ "false", "true" ]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));