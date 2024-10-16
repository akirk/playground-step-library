customSteps.runPHP = function( step ) {
	return [
		{
			"step": "runPHP",
			"code": "<?php require_once 'wordpress/wp-load.php'; " + step.vars.code + ';'
		}
	];
};
customSteps.runPHP.info = "Run code in the context of WordPress.";
customSteps.runPHP.vars = [
	{
		"name": "code",
		"description": "The code to run",
		"type": "textarea",
		"required": true,
		"samples": [ "" ]
	}
];
