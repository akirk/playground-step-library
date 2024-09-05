customSteps.addFilter = function( step ) {
	let code = "<?php require_once 'wordpress/wp-load.php'; add_filter( '" + step.vars.filter + "', " + step.vars.code;
	// if the step.vars.code is a php function get the number of arguments
	// and add them to the add_filter call
	if ( step.vars.code.match( /function\s*\(/i ) ) {
		let args = step.vars.code.match( /function\s*\((.*?)\)/i )[1].split( ',' ).length;
		code += ", " + args;
		if ( step.vars.priority != 10 ) {
			code += ", " + step.vars.priority;
		}
	} else if ( step.vars.priority != 10 ) {
		code += ", 1, " + step.vars.priority;
	}
	code += " ); ?>";
	return [
		{
			"step": "mkdir",
			"path": "wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "wordpress/wp-content/mu-plugins/addFilter-${stepIndex}.php",
			"data": code
		}
	];
};
customSteps.addFilter.info = "Easily add a filtered value.";
customSteps.addFilter.vars = [
	{
		"name": "filter",
		"description": "Name of the filter",
		"required": true,
		"samples": [ "init" ]
	},
	{
		"name": "code",
		"description": "Code for the filter",
		"type": "textarea",
		"required": true,
		"samples": [ "'__return_false'", "'__return_true'", "function ( $a, $b ) {\nreturn $a;\n}" ]
	},
	{
		"name": "priority",
		"description": "Priority of the filter",
		"required": false,
		"samples": [ "10" ]
	}
];
