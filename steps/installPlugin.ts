import { githubPlugin } from './githubPlugin.js';
import { githubPluginRelease } from './githubPluginRelease.js';
import type { StepFunction, InstallPluginStep, StepResult } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';


export const installPlugin: StepFunction<InstallPluginStep> = (step: InstallPluginStep): StepResult => {
	// Parse GitHub release URL
	const releasePattern = /\/releases\/download\/(?<version>[^\/]+)\/(?<asset>[^\/]+)$/;
	const releaseMatch = step.url.match(releasePattern);

	// Check if it's a GitHub URL
	const isGitHubUrl = step.url.match(/^(?:https:\/\/)?github\.com\//i) ||
	                    (!step.url.includes('://') && step.url.match(/^[^\/]+\/[^\/]+/));
	const urlPattern = /^(?:https:\/\/github\.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)/;
	const urlTest = isGitHubUrl ? urlPattern.exec(step.url) : null;

	// Extract WordPress.org slug
	let plugin = step.url;
	const slugPattern = /^https:\/\/wordpress.org\/plugins\/(?<slug>[^\/]+)/;
	const slugTest = slugPattern.exec(step.url);
	if (slugTest) {
		plugin = slugTest.groups!.slug;
	}

	// Delegate to GitHub handlers
	if (urlTest && releaseMatch) {
		return githubPluginRelease({
			step: 'githubPluginRelease',
			repo: urlTest.groups!.org + '/' + urlTest.groups!.repo,
			release: releaseMatch.groups!.version,
			filename: releaseMatch.groups!.asset
		});
	}

	if (urlTest) {
		return githubPlugin({
			step: 'githubPlugin',
			url: step.url,
			prs: step.prs
		});
	}

	// WordPress.org plugins and direct URLs
	return {
		toV1() {
			const pluginStep: any = {
				"step": "installPlugin",
				"pluginData": {
					"resource": "wordpress.org/plugins",
					"slug": plugin
				},
				"options": {
					"activate": true
				}
			};

			if (plugin.match(/^https?:/)) {
				pluginStep.pluginData = {
					resource: "url",
					url: plugin
				};
				try {
					const urlObj = new URL(plugin);
					const filename = urlObj.pathname.split('/').pop() || 'plugin';
					pluginStep.progress = {
						caption: `Installing plugin: ${filename} from ${urlObj.hostname}`
					};
				} catch (e) {
					pluginStep.progress = {
						caption: `Installing plugin from ${plugin}`
					};
				}
			}

			return { steps: [pluginStep] };
		},

		toV2(): BlueprintV2Declaration {
			return {
				version: 2,
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
