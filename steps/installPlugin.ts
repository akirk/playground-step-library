import { githubPlugin } from './githubPlugin.js';
import { githubPluginRelease } from './githubPluginRelease.js';
import type { StepFunction, InstallPluginStep } from './types.js';


export const installPlugin: StepFunction<InstallPluginStep> = (step: InstallPluginStep) => {
	// Check for GitHub PR URL
	const prTest = /^https:\/\/github.com\/(?<org>[^\/]+)\/(?<repo>[^\/]+)\/pull\/(?<prNumber>\d+)/.exec(step.url);
	if (prTest) {
		const { org, repo, prNumber } = prTest.groups!;
		// GitHub allows fetching PR branches using refs/pull/{number}/head
		// This works even for forked PRs
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

	let urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec(step.url);
	if (urlTest) {
		const releaseMatch = step.url.match(/\/releases\/download\/(?<version>[^\/]+)\/(?<asset>[^\/]+)$/);
		if (releaseMatch) {
			return githubPluginRelease({
				step: 'githubPluginRelease',
				repo: urlTest.groups!.org + '/' + urlTest.groups!.repo,
				release: releaseMatch.groups!.version,
				filename: releaseMatch.groups!.asset
			});
		}

		return githubPlugin({
			step: 'githubPlugin',
			url: step.url,
			prs: step.prs
		});
	}
	let plugin = step.url;
	urlTest = /^https:\/\/wordpress.org\/plugins\/(?<slug>[^\/]+)/.exec(step.url);
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
