import type { StepFunction, MuPluginStep, StepResult, V2SchemaFragments } from './types.js';


export const muPlugin: StepFunction<MuPluginStep> = (step: MuPluginStep): StepResult => {
	return {
		toV1() {
	const code = '<?php ' + (step.code || '').replace( /<\?php/, '' );
	const pluginName = step.name || 'mu-plugin';
	return [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": `/wordpress/wp-content/mu-plugins/${pluginName}-${step.stepIndex || 0}.php`,
			"data": code
		}
	];
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
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