export function changeAdminColorScheme( step ) {
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
changeAdminColorScheme.description = "Useful to combine with a login step.";
changeAdminColorScheme.vars = [
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
