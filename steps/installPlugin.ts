import { githubPlugin } from './githubPlugin.js';
import { githubPluginRelease } from './githubPluginRelease.js';
import type { StepFunction, InstallPluginStep, StepResult, V2SchemaFragments } from './types.js';


export const installPlugin: StepFunction<InstallPluginStep> = (step: InstallPluginStep): StepResult => {
	return {
		toV1() {
			const prPattern = /^https:\/\/github.com\/(?<org>[^\/]+)\/(?<repo>[^\/]+)\/pull\/(?<prNumber>\d+)/;
			const prTest = prPattern.exec(step.url);
			if (prTest) {
				const { org, repo, prNumber } = prTest.groups!;
				const repoUrl = `https://github.com/${org}/${repo}`;
				const caption = `Installing plugin from ${org}/${repo} PR #${prNumber}`;
				const outStep = {
					"step": "installPlugin",
					"pluginData": {
						"resource": "git:directory",
						"url": repoUrl,
						"ref": `refs/pull/${prNumber}/head`,
						"refType": "refname"
					},
					"options": {
						"activate": true
					},
					"progress": {
						"caption": caption
					}
				} as any;

				if (step.prs) {
					outStep.queryParams = outStep.queryParams || {};
					outStep.queryParams['gh-ensure-auth'] = 'yes';
					Object.assign(outStep.queryParams, {
						'ghexport-repo-url': repoUrl,
						'ghexport-content-type': 'plugin',
						'ghexport-plugin': repo,
						'ghexport-playground-root': `/wordpress/wp-content/plugins/${repo}`,
						'ghexport-pr-action': 'create',
						'ghexport-allow-include-zip': 'no',
					});
				}

				return [outStep];
			}

			const urlPattern = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/;
			let urlTest = urlPattern.exec(step.url);
			if (urlTest) {
				const releasePattern = /\/releases\/download\/(?<version>[^\/]+)\/(?<asset>[^\/]+)$/;
				const releaseMatch = step.url.match(releasePattern);
				if (releaseMatch) {
					return githubPluginRelease({
						step: 'githubPluginRelease',
						repo: urlTest.groups!.org + '/' + urlTest.groups!.repo,
						release: releaseMatch.groups!.version,
						filename: releaseMatch.groups!.asset
					}).toV1();
				}

				return githubPlugin({
					step: 'githubPlugin',
					url: step.url,
					prs: step.prs
				}).toV1();
			}

			let plugin = step.url;
			const slugPattern = /^https:\/\/wordpress.org\/plugins\/(?<slug>[^\/]+)/;
			urlTest = slugPattern.exec(step.url);
			if (urlTest) {
				plugin = urlTest.groups!.slug;
			}
			const steps = [
				{
					"step": "installPlugin",
					"pluginData": {
						"resource": "wordpress.org/plugins",
						"slug": plugin
					},
					"options": {
						"activate": true
					}
				}
			];
			if (plugin.match(/^https?:/)) {
				steps[0].pluginData = {
					resource: "url",
					url: plugin
				} as any;
				try {
					const urlObj = new URL(plugin);
					const filename = urlObj.pathname.split('/').pop() || 'plugin';
					(steps[0] as any).progress = {
						caption: `Installing plugin: ${filename} from ${urlObj.hostname}`
					};
				} catch (e) {
					(steps[0] as any).progress = {
						caption: `Installing plugin from ${plugin}`
					};
				}
			}
			return steps;
		},

		toV2(): V2SchemaFragments {
			const urlPattern = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/;
			let urlTest = urlPattern.exec(step.url);
			if (urlTest) {
				const releasePattern = /\/releases\/download\/(?<version>[^\/]+)\/(?<asset>[^\/]+)$/;
				const releaseMatch = step.url.match(releasePattern);
				if (releaseMatch) {
					const result = githubPluginRelease({
						step: 'githubPluginRelease',
						repo: urlTest.groups!.org + '/' + urlTest.groups!.repo,
						release: releaseMatch.groups!.version,
						filename: releaseMatch.groups!.asset
					});
					return result.toV2();
				}

				const result = githubPlugin({
					step: 'githubPlugin',
					url: step.url,
					prs: step.prs
				});
				return result.toV2();
			}

			let plugin = step.url;
			const slugPattern = /^https:\/\/wordpress.org\/plugins\/(?<slug>[^\/]+)/;
			urlTest = slugPattern.exec(step.url);
			if (urlTest) {
				plugin = urlTest.groups!.slug;
			}

			if (plugin.match(/^https?:/)) {
				return {
					plugins: [plugin]
				};
			}

			return {
				plugins: [plugin]
			};
		}
	};
};

installPlugin.description = "Install a plugin via WordPress.org or Github (branches, releases, PRs).";
installPlugin.builtin = true;
installPlugin.vars = [
	{
		name: "url",
		description: "URL of the plugin or WordPress.org slug.",
		required: true,
		samples: ["hello-dolly", 'https://wordpress.org/plugins/friends', 'woocommerce', 'create-block-theme', "https://github.com/akirk/blueprint-recorder", "https://github.com/Automattic/wordpress-activitypub/tree/trunk", "https://github.com/akirk/friends/pull/559"]
	},
	{
		name: "prs",
		description: "Add support for submitting GitHub Pull Requests.",
		show: function (step: any) {
		const url = step.querySelector('input[name=url]')?.value;
		return url && url.match(/^https:\/\/github.com\//);
		},
		type: "boolean",
		samples: ["false", "true"]
	}
];
