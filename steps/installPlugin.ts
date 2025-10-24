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
		return [{
			"step": "installPlugin",
			"pluginData": {
				"resource": "git:directory",
				"url": repoUrl,
				"ref": `refs/pull/${prNumber}/head`,
				"refType": "refname"
			},
			"options": {
				"activate": true
			}
		}];
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
			url: 'https://playground.wordpress.net/cors-proxy.php?' + plugin
		} as any;
	}
	if (step?.permalink) {
		steps.unshift({
			"step": "setSiteOptions",
			"options": {
				"permalink_structure": "/%postname%/"
			}
		} as any);
	}
	return steps;
};

installPlugin.description = "Install a plugin via WordPress.org or Github (branches, releases, PRs).";
installPlugin.builtin = true;
installPlugin.vars = Object.entries({
	url: {
		description: "URL of the plugin or WordPress.org slug.",
		required: true,
		samples: ["hello-dolly", 'https://wordpress.org/plugins/friends', 'woocommerce', 'create-block-theme', "https://github.com/akirk/blueprint-recorder", "https://github.com/Automattic/wordpress-activitypub/tree/trunk", "https://github.com/akirk/friends/pull/559"]
	},
	prs: {
		description: "Add support for submitting Github Requests.",
		show: function (step: any) {
			const url = step.querySelector('input[name=url]')?.value;
			console.log(url, url.match(/^https:\/\/github.com\//));
			return url && url.match(/^https:\/\/github.com\//);
		},
		type: "boolean",
		samples: ["false", "true"]
	},
	permalink: {
		description: "Requires a permalink structure",
		type: "boolean"
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));