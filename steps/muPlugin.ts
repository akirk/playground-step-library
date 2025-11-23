import type { StepFunction, MuPluginStep, StepResult } from './types.js';
import type { StepDefinition } from '@wp-playground/blueprints';

export const muPlugin: StepFunction<MuPluginStep> = (step: MuPluginStep): StepResult => {
	const code = '<?php ' + (step.vars?.code || '').replace(/<\?php/g, '');
	const pluginName = step.vars?.name || 'mu-plugin';

	return {
		toV1() {
			const steps: StepDefinition[] = [
				{
					// mkdir is necessary in v1 to ensure the directory exists
					step: "mkdir",
					path: "/wordpress/wp-content/mu-plugins",
				},
				{
					// stepIndex is kept to avoid collisions when multiple mu-plugin steps are used
					step: "writeFile",
					path: `/wordpress/wp-content/mu-plugins/${pluginName}-${step.stepIndex || 0}.php`,
					data: code
				}
			];
			return { steps };
		},

		toV2() {
			return {
				version: 2,
				muPlugins: [
					{
						file: {
							filename: `${pluginName}.php`,
							content: code
						}
					}
				]
			};
		}
	};
};

muPlugin.description = "Add code for a plugin.";
muPlugin.vars = [
	{
		name: "name",
		description: "Name for your mu-plugin file",
		type: "text",
		required: false,
		samples: [ 'my-plugin', 'custom-hooks' ]
	},
	{
		name: "code",
		description: "Code for your mu-plugin",
		type: "textarea",
		language: "php",
		required: true,
		samples: [ '' ]
	}
];