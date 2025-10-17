import type { StepFunction, GithubThemeStep} from './types.js';


export const githubTheme: StepFunction<GithubThemeStep> = (step: GithubThemeStep) => {
	const urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec( step.url );
	if ( ! urlTest ) {
		return [];
	}
	const repo = urlTest.groups!.org + "/" + urlTest.groups!.repo;
	const branch = urlTest.groups!.branch;
	if ( branch && ! /^[a-z0-9_-]+$/.test( branch ) ) {
		return [];
	}
	const repoUrl = `https://github.com/${repo}`;
	const directory = ( urlTest.groups!.directory || "" ).replace( /\/+$/, '' ).replace( /^\/+/, '' );

	const outStep = {
		"step": "installTheme",
		"themeData": {
			"resource": "git:directory",
			"url": repoUrl
		} as any,
		options: {
			activate: true,
		}
	} as any;

	if ( branch ) {
		outStep.themeData.ref = branch;
	}

	if ( directory ) {
		outStep.themeData.path = directory;
	}

	if ( step.prs ) {
		outStep.queryParams = {
			'gh-ensure-auth': 'yes',
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'theme',
			'ghexport-theme': urlTest.groups!.repo,
			'ghexport-playground-root': '/wordpress/wp-content/themes/' + urlTest.groups!.repo,
			'ghexport-pr-action': 'create',
			'ghexport-allow-include-zip': 'no',
		};
	}

	return [ outStep ];
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