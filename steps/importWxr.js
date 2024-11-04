customSteps.importWxr = function( step ) {
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
customSteps.importWxr.vars = [
	{
		"name": "url",
		"description": "URL of a WXR file",
		"required": true,
		"samples": [ "" ]
	}
];
