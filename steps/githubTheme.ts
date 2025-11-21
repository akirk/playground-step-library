import type { StepFunction, GithubThemeStep, StepResult } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';
import { v1ToV2Fallback } from './types.js';


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

	const themeData: Record<string, any> = {
		"resource": "git:directory",
		"url": repoUrl,
		"ref": branch || "HEAD"
	};

	if ( branch ) {
		themeData.refType = "branch";
	}

	if ( directory ) {
		themeData.path = directory;
	}

	const result: BlueprintV1Declaration = {
		steps: [{
			"step": "installTheme",
			"themeData": themeData as any,
			"options": {
				"activate": true
			},
			"progress": {
				"caption": `Installing theme from GitHub: ${repo}${branch ? ' (' + branch + ')' : ''}`
			}
		}]
	};

	if ( step.prs ) {
		(result.steps![0] as any).queryParams = {
			'gh-ensure-auth': 'yes',
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'theme',
			'ghexport-theme': urlTest.groups!.repo,
			'ghexport-playground-root': '/wordpress/wp-content/themes/' + urlTest.groups!.repo,
			'ghexport-pr-action': 'create',
			'ghexport-allow-include-zip': 'no',
		};
	}

	return result;
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

githubTheme.description = "Install a theme from a Github repository.";
githubTheme.deprecated = true;
githubTheme.vars = [
	{
		name: "url",
		description: "Github URL of the theme.",
		required: true,
		samples: [ "https://github.com/richtabor/kanso", "ndiego/nautilus", "https://github.com/Automattic/themes/tree/trunk/aether" ]
	},
	{
		name: "prs",
		description: "Add support for submitting Github Requests.",
		type: "boolean",
		samples: [ "false", "true" ]
	}
];