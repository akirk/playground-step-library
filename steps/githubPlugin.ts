import type { StepFunction, GithubPluginStep} from './types.js';


export const githubPlugin: StepFunction<GithubPluginStep> = (step: GithubPluginStep) => {
	const urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec( step.url );
	if ( !urlTest ) {
		return [];
	}
	const repo = urlTest.groups!.org + "/" + urlTest.groups!.repo;
	const branch = urlTest.groups!.branch;
	if ( branch && ! /^[a-z0-9_-]+$/.test( branch ) ) {
		return [];
	}
	const repoUrl = `https://github.com/${repo}`;
	const directory = ( urlTest.groups!.directory || '' ).replace( /\/+$/, '' ).replace( /^\/+/, '' );

	const outStep = {
		"step": "installPlugin",
		"pluginData": {
			"resource": "git:directory",
			"url": repoUrl,
			"ref": branch || "HEAD"
		} as any,
		options: {
			activate: true,
		}
	} as any;

	if ( branch ) {
		outStep.pluginData.refType = "branch";
	}

	if ( directory ) {
		outStep.pluginData.path = directory;
	}

	if ( step.prs ) {
		outStep.queryParams = {
			'gh-ensure-auth': 'yes',
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'plugin',
			'ghexport-plugin': urlTest.groups?.repo,
			'ghexport-playground-root': '/wordpress/wp-content/plugins/' + urlTest.groups?.repo,
			'ghexport-pr-action': 'create',
			'ghexport-allow-include-zip': 'no',
		};
	}

	outStep.progress = {
		caption: `Installing plugin from GitHub: ${repo}${branch ? ' (' + branch + ')' : ''}`
	};

	return [ outStep ];
};

githubPlugin.description = "Install a plugin from a Github repository.";
githubPlugin.vars = Object.entries({
	url: {
		description: "Github URL of the plugin.",
		samples: [ "https://github.com/akirk/blueprint-recorder" ]
	},
	prs: {
		description: "Add support for submitting Github Requests.",
		type: "boolean",
		samples: [ "false", "true" ]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));