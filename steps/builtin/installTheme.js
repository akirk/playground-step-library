customSteps.installTheme = function( step ) {
	const theme =  step?.vars?.theme;
	if ( ! theme ) {
		return [];
	}
	var steps = [
		{
			"step": "installTheme",
			"themeZipFile": {
                "resource": "wordpress.org/themes",
                "slug": theme
            },
            "options": {
                "activate": true
            }
		}
	];
	if ( theme.match( /^https?:/ ) ) {
		steps[0].themeZipFile = {
			resource: "url",
			url: plugin
		};
	}

	return steps;
}
customSteps.installTheme.description = "Install a theme";
customSteps.installTheme.builtin = true;
customSteps.installTheme.vars = [
	{
		"name": "theme",
		"description": "Theme slug",
		"required": true,
		"samples": [ "pendant", "slightly", "link-folio" ]
	}
];
