import { gitTheme } from './gitTheme.js';
import { detectGitProvider } from './gitProviders.js';
import type { StepFunction, InstallThemeStep, StepResult, CompilationContext } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';


export const installTheme: StepFunction<InstallThemeStep> = ( step: InstallThemeStep, context?: CompilationContext ): StepResult => {
	const url = step.vars?.url || '';

	// Check if it's a git provider URL
	const gitInfo = detectGitProvider(url);
	if (gitInfo) {
		return gitTheme({ step: 'gitTheme', vars: { url: url, prs: step.vars?.prs } }, context);
	}

	// Extract WordPress.org slug
	let theme: string | undefined = url;
	const slugPattern = /^https:\/\/wordpress.org\/themes\/(?<slug>[^\/]+)/;
	const slugMatch = url.match(slugPattern);
	if (slugMatch && slugMatch.groups) {
		theme = slugMatch.groups.slug;
	}

	if (!theme) {
		return {
			toV1() { return { steps: [] }; },
			toV2() { return { version: 2 }; }
		};
	}

	// WordPress.org themes and direct URLs
	return {
		toV1() {
			const themeStep: any = {
				"step": "installTheme",
				"themeData": {
					"resource": "wordpress.org/themes",
					"slug": theme
				},
				"options": {
					"activate": true
				},
				"progress": {
					"caption": `Installing theme: ${theme}`
				}
			};

			if (theme.match(/^https?:/)) {
				themeStep.themeData = {
					resource: "url",
					url: theme
				};
			}

			return { steps: [themeStep] };
		},

		toV2(): BlueprintV2Declaration {
			return {
				version: 2,
				themes: [theme]
			};
		}
	};
};

installTheme.description = 'Install a theme via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).';
installTheme.builtin = true;
installTheme.vars = [
	{
		name: 'url',
		description: 'URL of the theme or WordPress.org slug.',
		required: true,
		samples: [
			'pendant',
			'https://github.com/richtabor/kanso',
			'https://github.com/Automattic/themes/tree/trunk/aether',
			'https://codeberg.org/cranca/boo-theme',
			'link-folio',
		],
	},
	{
		name: 'prs',
		description: 'Add support for submitting Pull Requests (GitHub only).',
		show: function (step: any) {
			const url = step.querySelector('input[name=url]')?.value;
			return url && url.match(/^(?:https:\/\/)?github\.com\//i);
		},
		type: 'boolean',
		samples: ['false', 'true'],
	},
];