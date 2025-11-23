import type { StepFunction, GithubPluginReleaseStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';


export const githubPluginRelease: StepFunction<GithubPluginReleaseStep> = (step: GithubPluginReleaseStep): StepResult => {
	const repoPattern = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/;

	return {
		toV1() {
			const repoTest = repoPattern.exec( step.vars?.repo );
			if ( ! repoTest ) {
				return { steps: [] };
			}
			const repo = repoTest[1] + "/" + repoTest[2];
			const tag = step.vars?.release;
			const filename = step.vars?.filename;

			return {
				steps: [
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
				]
			};
		},

		toV2(): BlueprintV2Declaration {
			const repoTest = repoPattern.exec( step.vars?.repo );
			if ( ! repoTest ) {
				return { version: 2 };
			}
			const repo = repoTest[1] + "/" + repoTest[2];
			const tag = step.vars?.release;
			const filename = step.vars?.filename;
			const url = `https://github.com/${repo}/releases/download/${tag}/${filename}`;

			return {
				version: 2,
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
		required: true,
		samples: [ "ryanwelcher/interactivity-api-todomvc" ]
	},
	{
		name: "release",
		description: "The release tag.",
		required: true,
		samples: [ "v0.1.3" ]
	},
	{
		name: "filename",
		description: "Which filename to use.",
		required: true,
		samples: [ "to-do-mvc.zip" ]
	}
];
