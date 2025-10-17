import type { StepFunction, GithubPluginReleaseStep} from './types.js';


export const githubPluginRelease: StepFunction<GithubPluginReleaseStep> = (step: GithubPluginReleaseStep) => {
	const repoTest = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/.exec( step.repo );
	if ( ! repoTest ) {
		return [];
	}
	const repo = repoTest[1] + "/" + repoTest[2];
	const tag = step.release;
	const filename = step.filename;

	return [
		{
			"step": "installPlugin",
			"pluginData": {
				"resource": "url",
				"url": `https://github.com/${repo}/releases/download/${tag}/${filename}`
			},
			"options": {
				"activate": true
			}
		}
	];
};

githubPluginRelease.description = "Install a specific plugin release from a Github repository.";
githubPluginRelease.vars = Object.entries({
	repo: {
		description: "The plugin resides in this GitHub repository.",
		samples: [ "ryanwelcher/interactivity-api-todomvc" ]
	},
	release: {
		description: "The release tag.",
		samples: [ "v0.1.3" ]
	},
	filename: {
		description: "Which filename to use.",
		samples: [ "to-do-mvc.zip" ]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));