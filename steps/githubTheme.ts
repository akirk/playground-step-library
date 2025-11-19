import type { StepFunction, GithubThemeStep, StepResult, V2SchemaFragments } from './types.js';


export const githubTheme: StepFunction<GithubThemeStep> = (step: GithubThemeStep): StepResult => {
	return {
		toV1() {
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
			"url": repoUrl,
			"ref": branch || "HEAD"
		} as any,
		options: {
			activate: true,
		}
	} as any;

	if ( branch ) {
		outStep.themeData.refType = "branch";
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

	outStep.progress = {
		caption: `Installing theme from GitHub: ${repo}${branch ? ' (' + branch + ')' : ''}`
	};

	return [ outStep ];
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
			};
		}
	};
};

githubTheme.description = "Install a theme from a Github repository.";
githubTheme.deprecated = true;
githubTheme.vars = [
	{
		name: "url",
		description: "Github URL of the theme.",
		samples: [ "https://github.com/richtabor/kanso", "ndiego/nautilus", "https://github.com/Automattic/themes/tree/trunk/aether" ]
	},
	{
		name: "prs",
		description: "Add support for submitting Github Requests.",
		type: "boolean",
		samples: [ "false", "true" ]
	}
];