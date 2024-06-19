customSteps.installPlugin = function( step ) {
	const plugin =  step?.vars?.plugin;
	if ( ! plugin ) {
		return [];
	}
	var steps = [
		{
			"step": "installPlugin",
			"pluginZipFile": {
                "resource": "wordpress.org/plugins",
                "slug": plugin
            },
            "options": {
                "activate": true
            }
		}
	];
	return steps;
}
customSteps.installPlugin.description = "Install a plugin";
customSteps.installPlugin.builtin = true;
customSteps.installPlugin.vars = [
	{
		"name": "plugin",
		"description": "Plugin slug",
		"required": true,
		"sample": "hello-dolly"
	}
];
