export function runWpCliCommand (step) {
	return [
		{
			step: 'wp-cli',
			command: step.vars.command
		}
	];
};
runWpCliCommand.description = "Run a wp-cli command.";
runWpCliCommand.vars = [
	{
		"name": "command",
		"description": "The wp-cli command to run",
		"required": true,
		"samples": [""]
	}
];
