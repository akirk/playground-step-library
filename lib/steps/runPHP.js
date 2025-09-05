const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const runPHP = (step) => {
    return [
        {
            "step": "runPHP",
            code: step.code
        }
    ];
};
runPHP.description = "Run code in the context of WordPress.";
runPHP.builtin = true;
runPHP.vars = createVarsConfig({
    code: {
        description: "The code to run",
        type: "textarea",
        required: true,
        samples: [""]
    }
});
//# sourceMappingURL=runPHP.js.map