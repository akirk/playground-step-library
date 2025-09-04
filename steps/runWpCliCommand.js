customSteps.runWpCliCommand = function (step) {
	return [
		{
			step: 'wp-cli',
			command: step.vars.command
		}
	];
};
customSteps.runWpCliCommand.description = "Run a wp-cli command.";
customSteps.runWpCliCommand.vars = [
	{
		"name": "command",
		"description": "The wp-cli command to run",
		"required": true,
		"samples": [""]
	}
];
