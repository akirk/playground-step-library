import type { StepFunction, GithubPluginReleaseStep, StepResult, V2SchemaFragments } from './types.js';


export const githubPluginRelease: StepFunction<GithubPluginReleaseStep> = (step: GithubPluginReleaseStep): StepResult => {
	return {
		toV1() {
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
					},
					"progress": {
						"caption": `Installing ${filename} from ${repo} (${tag})`
					}
				}
			];
		},

		toV2(): V2SchemaFragments {
			const repoTest = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/.exec( step.repo );
			if ( ! repoTest ) {
				return {};
			}
			const repo = repoTest[1] + "/" + repoTest[2];
			const tag = step.release;
			const filename = step.filename;
			const url = `https://github.com/${repo}/releases/download/${tag}/${filename}`;

			return {
				plugins: [url]
			};
		}
	};
};

githubPluginRelease.description = "Install a specific plugin release from a Github repository.";
githubPluginRelease.deprecated = true;
githubPluginRelease.vars = [
	{
		name: "repo",
		description: "The plugin resides in this GitHub repository.",
		samples: [ "ryanwelcher/interactivity-api-todomvc" ]
	},
	{
		name: "release",
		description: "The release tag.",
		samples: [ "v0.1.3" ]
	},
	{
		name: "filename",
		description: "Which filename to use.",
		samples: [ "to-do-mvc.zip" ]
	}
];
