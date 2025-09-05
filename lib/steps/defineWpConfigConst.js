const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const defineWpConfigConst = (step) => {
    if (!step.name) {
        return [];
    }
    const constStep = {
        "step": "defineWpConfigConsts",
        "consts": {}
    };
    if (Array.isArray(step.name)) {
        step.name.forEach((name, index) => {
            if (!name) {
                return;
            }
            const values = Array.isArray(step.value) ? step.value : [step.value];
            const value = values[index];
            if (value === 'true') {
                constStep.consts[name] = true;
            }
            else if (value === 'false') {
                constStep.consts[name] = false;
            }
            else {
                constStep.consts[name] = value;
            }
        });
    }
    else {
        constStep.consts[step.name] = step.value;
    }
    return [constStep];
};
defineWpConfigConst.description = "Define a wp-config PHP constant.";
defineWpConfigConst.builtin = true;
defineWpConfigConst.multiple = true;
defineWpConfigConst.vars = createVarsConfig({
    name: {
        description: "Constant name",
        samples: ["WP_DEBUG"]
    },
    value: {
        description: "Constant value",
        samples: ["true"]
    }
});
//# sourceMappingURL=defineWpConfigConst.js.map