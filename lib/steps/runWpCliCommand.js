export const runWpCliCommand = (step) => {
    return [
        {
            step: 'wp-cli',
            command: step.command
        }
    ];
};
runWpCliCommand.description = "Run a wp-cli command.";
runWpCliCommand.vars = Object.entries({
    command: {
        description: "The wp-cli command to run",
        required: true,
        samples: [""]
    }
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=runWpCliCommand.js.map