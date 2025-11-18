import { githubTheme } from './githubTheme.js';
import type { StepFunction, InstallThemeStep } from './types.js';


export const installTheme: StepFunction<InstallThemeStep> = (step: InstallThemeStep) => {
	let urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec(step.url);
	if (urlTest) {
		return githubTheme({
			step: 'githubTheme',
			url: step.url,
			prs: step.prs
		});
	}

	let theme = step.url;
	urlTest = /^https:\/\/wordpress.org\/themes\/(?<slug>[^\/]+)/.exec(step.url);
	if (urlTest) {
		theme = urlTest.groups!.slug;
	}
	if (!theme) {
		return [];
	}
	const steps = [
		{
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
		}
	];
	if (theme.match(/^https?:/)) {
		steps[0].themeData = {
			resource: "url",
			url: theme
		} as any;
	}

	return steps;
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