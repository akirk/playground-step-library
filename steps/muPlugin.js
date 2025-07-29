customSteps.muPlugin = function( step ) {
	const code = '<?php ' + step.vars.code.replace( /<\?php/, '' );
	return [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/addFilter-${stepIndex}.php",
			"data": code
		}
	];
};
customSteps.muPlugin.info = "Add code for a plugin.";
customSteps.muPlugin.vars = [
	{
		"name": "code",
		"description": "Code for your mu-plugin",
		"type": "textarea",
		"required": true,
		"samples": [ '' ]
	}
];
