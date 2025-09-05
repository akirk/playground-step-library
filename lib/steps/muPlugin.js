const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const muPlugin = (step) => {
    const code = '<?php ' + (step.code || '').replace(/<\?php/, '');
    return [
        {
            "step": "mkdir",
            "path": "/wordpress/wp-content/mu-plugins",
        },
        {
            "step": "writeFile",
            "path": "/wordpress/wp-content/mu-plugins/addFilter-${stepIndex}.php",
            "data": code
        }
    ];
};
muPlugin.description = "Add code for a plugin.";
muPlugin.vars = createVarsConfig({
    code: {
        description: "Code for your mu-plugin",
        type: "textarea",
        required: true,
        samples: ['']
    }
});
//# sourceMappingURL=muPlugin.js.map