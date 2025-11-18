import type { StepFunction, GithubPluginStep} from './types.js';


export const githubPlugin: StepFunction<GithubPluginStep> = (step: GithubPluginStep) => {
	const urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branchAndDir>.+))?$/.exec( step.url );
	if ( !urlTest ) {
		return [];
	}
	const repo = urlTest.groups!.org + "/" + urlTest.groups!.repo;

	let branch = urlTest.groups!.branchAndDir;
	let directory = '';

	if ( branch ) {
		branch = branch.replace( /\/+$/, '' );

		const doubleSlashIndex = branch.indexOf( '//' );
		if ( doubleSlashIndex !== -1 ) {
			directory = branch.substring( doubleSlashIndex + 2 );
			branch = branch.substring( 0, doubleSlashIndex );
		} else {
			const firstSlashIndex = branch.indexOf( '/' );
			if ( firstSlashIndex !== -1 ) {
				const potentialDir = branch.substring( firstSlashIndex + 1 );
				if ( potentialDir.includes( '/' ) ) {
					directory = potentialDir;
					branch = branch.substring( 0, firstSlashIndex );
				}
			}
		}

		if ( ! /^[a-zA-Z0-9_.\/-]+$/.test( branch ) ) {
			return [];
		}
	}

	const repoUrl = `https://github.com/${repo}`;

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
		outStep.queryParams = outStep.queryParams || {};
		outStep.queryParams['gh-ensure-auth'] = 'yes';
		Object.assign(outStep.queryParams, {
			'ghexport-repo-url': 'https://github.com/' + repo,
			'ghexport-content-type': 'plugin',
			'ghexport-plugin': urlTest.groups?.repo,
			'ghexport-playground-root': '/wordpress/wp-content/plugins/' + urlTest.groups?.repo,
			'ghexport-pr-action': 'create',
			'ghexport-allow-include-zip': 'no',
		});
	}

	outStep.progress = {
		caption: `Installing plugin from GitHub: ${repo}`
	};

	return [ outStep ];
};

githubPlugin.description = "Install a plugin from a Github repository.";
githubPlugin.deprecated = true;
githubPlugin.vars = [
	{
		name: "url",
		description: "Github URL of the plugin.",
		samples: [ "https://github.com/akirk/blueprint-recorder" ]
	},
	{
		name: "prs",
		description: "Add support for submitting GitHub Pull Requests.",
		type: "boolean",
		samples: [ "false", "true" ]
	}
];