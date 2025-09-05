export function runPHP (step) {
	return [
		{
			"step": "runPHP",
			code
		}
	];
};
runPHP.description = "Run code in the context of WordPress.";
runPHP.vars = [
	{
		"name": "code",
		"description": "The code to run",
		"type": "textarea",
		"required": true,
		"samples": [""]
	}
];
