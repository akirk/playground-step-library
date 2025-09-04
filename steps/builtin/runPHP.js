customSteps.runPHP = function (step) {
	return [
		{
			"step": "runPHP",
			code
		}
	];
};
customSteps.runPHP.description = "Run code in the context of WordPress.";
customSteps.runPHP.vars = [
	{
		"name": "code",
		"description": "The code to run",
		"type": "textarea",
		"required": true,
		"samples": [""]
	}
];
