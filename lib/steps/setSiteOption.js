export const setSiteOption = (step) => {
    if (!step.name) {
        return [];
    }
    const optionStep = {
        "step": "setSiteOptions",
        "options": {}
    };
    if (Array.isArray(step.name)) {
        step.name.forEach((name, index) => {
            if (!name) {
                return;
            }
            optionStep.options[name] = Array.isArray(step.value) ? step.value[index] : step.value;
        });
    }
    else {
        optionStep.options[step.name] = step.value;
    }
    return [optionStep];
};
setSiteOption.description = "Set a site option.";
setSiteOption.builtin = true;
setSiteOption.multiple = true;
setSiteOption.vars = Object.entries({
    name: {
        description: "Option name",
        samples: ["", "permalink_structure"]
    },
    value: {
        description: "Option value",
        samples: ["", "/%postname%/"]
    }
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=setSiteOption.js.map