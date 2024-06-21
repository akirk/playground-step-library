customSteps.changeAdminColorScheme = function( step ) {
	var steps = [
		{
			"step": "mkdir",
			"path": "wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "wordpress/wp-content/mu-plugins/${step}-mu.php",
			"data": "<?php add_filter( 'get_user_option_admin_color', function() { return '${colorScheme}'; } ); ?>"
		}
	];
	return steps;
};
customSteps.changeAdminColorScheme.info = "Useful to combine with a login step.";
customSteps.changeAdminColorScheme.vars = [
	{
		"name": "colorScheme",
		"description": "Color scheme",
		"required": true,
		"samples": [
			'modern',
			'light',
			'fresh',
			'blue',
			'coffee',
			'ectoplasm',
			'midnight',
			'ocean',
			'sunrise'
		]
	}
];
