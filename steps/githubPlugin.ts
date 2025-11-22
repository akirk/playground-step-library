import type { StepFunction, GithubPluginStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';


export const githubPlugin: StepFunction<GithubPluginStep> = (step: GithubPluginStep): StepResult => {
	return {
		toV1() {
			// Parse PR URLs
			const prPattern = /^(?:https:\/\/)?(?:github\.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)\/pull\/(?<prNumber>\d+)/;
			const prTest = prPattern.exec(step.url);

			// Parse regular GitHub URLs (branches, etc.)
			const regexPattern = /^(?:https:\/\/)?(?:github\.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branchAndDir>.+))?$/;
			const urlTest = regexPattern.exec(step.url);
			if (!urlTest && !prTest) {
				return { steps: [] };
			}

			// Use prTest for repo info if urlTest didn't match (PR URLs)
			const repoInfo = urlTest || prTest;
			const repo = repoInfo!.groups!.org + "/" + repoInfo!.groups!.repo;
			const repoUrl = `https://github.com/${repo}`;

			let ref = "HEAD";
			let refType: string | undefined = undefined;
			let directory = '';
			let caption = `Installing plugin from GitHub: ${repo}`;

			if (prTest) {
				// PR URL
				const { prNumber } = prTest.groups!;
				ref = `refs/pull/${prNumber}/head`;
				refType = 'refname';
				caption = `Installing plugin from ${repo} PR #${prNumber}`;
			} else if (urlTest && urlTest.groups!.branchAndDir) {
				// Branch/directory URL
				let branch = urlTest.groups!.branchAndDir;
				branch = branch.replace(/\/+$/, '');

				const doubleSlashIndex = branch.indexOf('//');
				if (doubleSlashIndex !== -1) {
					directory = branch.substring(doubleSlashIndex + 2);
					branch = branch.substring(0, doubleSlashIndex);
				} else {
					const firstSlashIndex = branch.indexOf('/');
					if (firstSlashIndex !== -1) {
						const potentialDir = branch.substring(firstSlashIndex + 1);
						if (potentialDir.includes('/')) {
							directory = potentialDir;
							branch = branch.substring(0, firstSlashIndex);
						}
					}
				}

				if (! /^[a-zA-Z0-9_.\/-]+$/.test(branch)) {
					return { steps: [] };
				}

				ref = branch;
				refType = "branch";
			}

			const pluginData: Record<string, any> = {
				"resource": "git:directory",
				"url": repoUrl,
				"ref": ref
			};

			if (refType) {
				pluginData.refType = refType;
			}

			if (directory) {
				pluginData.path = directory;
			}

			const result: BlueprintV1Declaration = {
				steps: [{
					"step": "installPlugin",
					"pluginData": pluginData as any,
					"options": {
						"activate": true
					},
					"progress": {
						"caption": caption
					}
				}]
			};

			if (step.prs) {
				(result.steps![0] as any).queryParams = {
					'gh-ensure-auth': 'yes',
					'ghexport-repo-url': repoUrl,
					'ghexport-content-type': 'plugin',
					'ghexport-plugin': repoInfo!.groups!.repo,
					'ghexport-playground-root': `/wordpress/wp-content/plugins/${repoInfo!.groups!.repo}`,
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

githubPlugin.description = "Install a plugin from a Github repository.";
githubPlugin.deprecated = true;
githubPlugin.vars = [
	{
		name: "url",
		description: "Github URL of the plugin.",
		required: true,
		samples: ["https://github.com/akirk/blueprint-recorder"]
	},
	{
		name: "prs",
		description: "Add support for submitting GitHub Pull Requests.",
		type: "boolean",
		samples: ["false", "true"]
	}
];
