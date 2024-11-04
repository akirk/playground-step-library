customSteps.importWxr = function( step ) {
	if ( ! step.vars.url || ! step.vars.url.match( /^https?:/ ) ) {
		return [];
	}
	return [
		{
			"step": "importWxr",
			"file": {
                "resource": "url",
                "url": step.vars.url
            }
		}
	];
};
customSteps.importWxr.info = "Import a WXR from a URL.";
customSteps.importWxr.builtin = true;
customSteps.importWxr.vars = [
	{
		"name": "url",
		"description": "URL of a WXR file",
		"required": true,
		"samples": [ "" ]
	}
];
