import { githubPlugin } from './githubPlugin.js';
import { githubPluginRelease } from './githubPluginRelease.js';
import type { StepFunction, InstallPluginStep } from './types.js';


export const installPlugin: StepFunction<InstallPluginStep> = (step: InstallPluginStep) => {
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

		const githubSteps = githubPlugin({
			step: 'githubPlugin',
			url: step.url,
			prs: step.prs
		});

		// If branch is known, automatically add activatePlugin step
		if (urlTest.groups!.branch) {
			const repo = urlTest.groups!.repo;
			const branch = urlTest.groups!.branch;
			const directory = urlTest.groups!.directory;

			let pluginPath;
			if (directory) {
				// For subdirectory plugins, use the lowest directory name
				const dirBasename = directory.replace(/\/+$/, '').replace(/^\/+/, '').split('/').pop();
				pluginPath = `/wordpress/wp-content/plugins/${dirBasename}/${repo}.php`;
			} else {
				// Standard case: repo-branch/repo.php
				pluginPath = `/wordpress/wp-content/plugins/${repo}-${branch}/${repo}.php`;
			}

			githubSteps.push({
				step: 'activatePlugin',
				pluginPath: pluginPath
			});
		}

		return githubSteps;
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

installPlugin.description = "Install a plugin via WordPress.org or Github.";
installPlugin.builtin = true;
installPlugin.vars = Object.entries({
	url: {
		description: "URL of the plugin or WordPress.org slug.",
		required: true,
		samples: ["hello-dolly", 'https://wordpress.org/plugins/friends', 'woocommerce', 'create-block-theme', "https://github.com/akirk/blueprint-recorder", "https://github.com/Automattic/wordpress-activitypub/tree/trunk"]
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