customSteps.installTheme = function( step ) {
	let urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec( step.vars.url );
	if ( urlTest ) {
		return customSteps.githubTheme( step );
	}

	let theme = step.vars.url;
	urlTest = /^(?:https:\/\/wordpress.org\/themes\/)?(?<slug>[^\/]+)/.exec( step.vars.url );
	if ( urlTest ) {
		theme = urlTest.groups.slug;
	}
	if ( ! theme ) {
		return [];
	}
	var steps = [
		{
			"step": "installTheme",
			"themeData": {
                "resource": "wordpress.org/themes",
                "slug": theme
            },
            "options": {
                "activate": true
            }
		}
	];
	if ( theme.match( /^https?:/ ) ) {
		steps[0].themeData = {
			resource: "url",
			url: 'https://playground.wordpress.net/cors-proxy.php?' + theme
		};
	}

	return steps;
}
customSteps.installTheme.description = "Install a theme";
customSteps.installTheme.builtin = true;
customSteps.installTheme.vars = [
	{
		"name": "url",
		"description": "URL of the theme or WordPress.org slug",
		"required": true,
		"samples": [ "pendant", "https://github.com/richtabor/kanso", "ndiego/nautilus", "https://github.com/Automattic/themes/tree/trunk/aether", "link-folio" ]
	},
	{
		"name": "prs",
		"description": "Add support for submitting Github Requests.",
		"show": function( step ) {
			const url = step.querySelector('input[name=url]')?.value;
			console.log( url, url.match( /^https:\/\/github.com\// ) );
			return url && url.match( /^https:\/\/github.com\// );
		},
		"type": "boolean",
		"samples": [ "false", "true" ]
	}
];
