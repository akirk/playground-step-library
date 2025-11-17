import type { StepFunction, MuPluginStep} from './types.js';


export const muPlugin: StepFunction<MuPluginStep> = (step: MuPluginStep) => {
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
};

muPlugin.description = "Add code for a plugin.";
muPlugin.vars = Object.entries({
	name: {
		description: "Name for your mu-plugin file",
		type: "text",
		required: false,
		samples: [ 'my-plugin', 'custom-hooks' ]
	},
	code: {
		description: "Code for your mu-plugin",
		type: "textarea",
		language: "php",
		required: true,
		samples: [ '' ]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));