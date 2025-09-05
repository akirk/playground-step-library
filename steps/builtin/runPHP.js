export function runPHP(step) {
	return [
		{
			"step": "runPHP",
			code: step.vars.code
		}
	];
};
runPHP.description = "Run code in the context of WordPress.";
runPHP.builtin = true;
runPHP.vars = [
	{
		"name": "code",
		"description": "The code to run",
		"type": "textarea",
		"required": true,
		"samples": [""]
	}
];
