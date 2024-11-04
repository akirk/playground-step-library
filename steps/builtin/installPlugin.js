customSteps.installPlugin = function( step ) {
	const plugin =  step?.vars?.plugin;
	if ( ! plugin ) {
		return [];
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
		steps[0].pluginData.resource = "url";
		steps[0].pluginData.url = plugin;
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
customSteps.installPlugin.description = "Install a plugin";
customSteps.installPlugin.builtin = true;
customSteps.installPlugin.vars = [
	{
		"name": "plugin",
		"description": "Plugin slug",
		"required": true,
		"samples": [ "hello-dolly", 'friends', 'woocommerce', 'create-block-theme' ]
	},
	{
		"name": "permalink",
		"description": "Requires a permalink structure",
		"type": "boolean"
	}
];
