customSteps.installPlugin = function( step ) {
	let urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec( step.vars.url );
	if ( urlTest ) {
		return customSteps.githubPlugin( step );
	}
	let plugin = step.vars.url;
	urlTest = /^(?:https:\/\/wordpress.org\/plugins\/)?(?<slug>[^\/]+)/.exec( step.vars.url );
	if ( urlTest ) {
		plugin = urlTest.groups.slug;
	}
	var steps = [
		{
			"step": "installPlugin",
			"pluginData": {
                "resource": "wordpress.org/plugins",
                "slug": plugin
            },
            "options": {
                "activate": true
            }
		}
	];
	if ( plugin.match( /^https?:/ ) ) {
		steps[0].pluginData = {
			resource: "url",
			url: 'https://playground.wordpress.net/cors-proxy.php?' + plugin
		};
	}
	if ( step?.vars?.permalink ) {
		steps.unshift({
			"step": "setSiteOptions",
			"options": {
				"permalink_structure": "/%postname%/"
			}
		});
	}
	return steps;
}
customSteps.installPlugin.description = "Install a plugin via WordPress.org or Github";
customSteps.installPlugin.builtin = true;
customSteps.installPlugin.vars = [
	{
		"name": "url",
		"description": "URL of the plugin or WordPress.org slug.",
		"samples": [ "hello-dolly", 'https://wordpress.org/plugins/friends', 'woocommerce', 'create-block-theme', "https://github.com/akirk/blueprint-recorder", "https://github.com/Automattic/wordpress-activitypub/tree/trunk" ]
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
	},
	{
		"name": "permalink",
		"description": "Requires a permalink structure",
		"type": "boolean"
	}
];
