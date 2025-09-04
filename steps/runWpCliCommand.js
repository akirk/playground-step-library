customSteps.runWpCliCommand = function( step ) {
	return [
	{
		step: 'wp-cli',
		command: step.vars.command
	}
	];
};
customSteps.runWpCliCommand.description = "";
customSteps.runWpCliCommand.vars = [
	{
		"name": "command",
		"description": "The wp-cli command to run",
		"required": true,
		"samples": [ "" ]
	}
];
