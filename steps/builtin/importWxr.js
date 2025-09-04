customSteps.importWxr = function( step ) {
	if ( ! step.vars.url || ! step.vars.url.match( /^https?:/ ) ) {
		return [];
	}
	const url = step.vars.corsProxy ? 'https://playground.wordpress.net/cors-proxy.php?' + step.vars.url : step.vars.url;
	return [
		{
			"step": "importWxr",
			"file": {
				"resource": "url",
				url
			}
		}
	];
};
customSteps.importWxr.description = "Import a WXR from a URL.";
customSteps.importWxr.builtin = true;
customSteps.importWxr.vars = [
	{
		"name": "url",
		"description": "URL of a WXR file",
		"required": true,
		"samples": [ "" ]
	},
	{
		"name": "corsProxy",
		"description": "Use a cors proxy for the request",
		"required": true,
		"type": "boolean",
		"samples": [ "true", "false" ]
	}
];
