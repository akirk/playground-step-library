import { gitPlugin } from './gitPlugin.js';
import { detectGitProvider } from './gitProviders.js';
import type { StepFunction, InstallPluginStep, StepResult, CompilationContext } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';


export const installPlugin: StepFunction<InstallPluginStep> = ( step: InstallPluginStep, context?: CompilationContext ): StepResult => {
	const url = step.vars?.url || '';

	// Check if it's a git provider URL
	const gitInfo = detectGitProvider( url );
	if ( gitInfo ) {
		return gitPlugin( { step: 'gitPlugin', vars: { url: url, prs: step.vars?.prs } }, context );
	}

	// Extract WordPress.org slug
	let plugin: string = url;
	const slugPattern = /^https:\/\/wordpress.org\/plugins\/(?<slug>[^\/]+)/;
	const slugTest = url.match( slugPattern );
	if ( slugTest ) {
		plugin = slugTest.groups!.slug;
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

installPlugin.description = 'Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).';
installPlugin.builtin = true;
installPlugin.vars = [
	{
		name: 'url',
		description: 'URL of the plugin or WordPress.org slug.',
		required: true,
		samples: [
			'hello-dolly',
			'https://wordpress.org/plugins/friends',
			'woocommerce',
			'https://github.com/akirk/blueprint-recorder',
			'https://gitlab.com/webwirtschaft/structured-content',
			'https://github.com/akirk/friends/pull/559',
		],
	},
	{
		name: 'prs',
		description: 'Add support for submitting Pull Requests (GitHub only).',
		show: function( step: any ) {
			const url = step.querySelector( 'input[name=url]' )?.value;
			return url && url.match( /^(?:https:\/\/)?github\.com\//i );
		},
		type: 'boolean',
		samples: [ 'false', 'true' ],
	},
];
