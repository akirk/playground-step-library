customSteps.setSiteName = function( step ) {
	return [
		{
            "step": "setSiteOptions",
            "options": {
                "blogname": "${sitename}"
            }
        }
	];
};
customSteps.setSiteName.vars = [
	{
		"name": "sitename",
		"description": "Name of the site",
		"required": true,
		"samples": [ "Step Library Demo" ]
	}
];
