const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const runWpCliCommand = (step) => {
    return [
        {
            step: 'wp-cli',
            command: step.command
        }
    ];
};
runWpCliCommand.description = "Run a wp-cli command.";
runWpCliCommand.vars = createVarsConfig({
    command: {
        description: "The wp-cli command to run",
        required: true,
        samples: [""]
    }
});
//# sourceMappingURL=runWpCliCommand.js.map