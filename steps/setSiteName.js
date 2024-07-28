customSteps.setSiteName = function( step ) {
	return [
		{
            "step": "setSiteOptions",
            "options": {
                "blogname": "${sitename}",
                "blogdescription": "${tagline}",
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
	},
	{
		"name": "tagline",
		"description": "What the site is about",
		"required": true,
		"samples": [ "Trying out WordPress Playground." ]
	}
];
