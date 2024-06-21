customSteps.changeAdminColorScheme = function( step ) {
	return [
		{
			"step": "updateUserMeta",
			"meta": {
				"admin_color": "${colorScheme}"
			},
			"userId": 1
		}
	];
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
