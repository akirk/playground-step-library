import { githubTheme } from './githubTheme.js';
import type { StepFunction, InstallThemeStep , StepResult } from './types.js';
import type { BlueprintV2Declaration } from '@wp-playground/blueprints';


export const installTheme: StepFunction<InstallThemeStep> = (step: InstallThemeStep): StepResult => {
	// Check if it's a GitHub URL
	const githubPattern = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/;
	const isGitHubUrl = githubPattern.test(step.url) && step.url.match(githubPattern);

	if (isGitHubUrl) {
		return githubTheme({
			step: 'githubTheme',
			url: step.url,
			prs: step.prs
		});
	}

	// Extract WordPress.org slug
	let theme = step.url;
	const slugPattern = /^https:\/\/wordpress.org\/themes\/(?<slug>[^\/]+)/;
	const slugMatch = step.url.match(slugPattern);
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

installTheme.description = "Install a theme via WordPress.org or Github.";
installTheme.builtin = true;
installTheme.vars = [
	{
		name: "url",
		description: "URL of the theme or WordPress.org slug",
		required: true,
		samples: ["pendant", "https://github.com/richtabor/kanso", "ndiego/nautilus", "https://github.com/Automattic/themes/tree/trunk/aether", "link-folio"]
	},
	{
		name: "prs",
		description: "Add support for submitting Github Requests.",
		show: function (step: any) {
		const url = step.querySelector('input[name=url]')?.value;
		return url && url.match(/^https:\/\/github.com\//);
		},
		type: "boolean",
		samples: ["false", "true"]
	}
];