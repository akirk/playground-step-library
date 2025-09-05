const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const login = (step) => {
    const steps = [
        {
            "step": "login",
            "username": step.username,
            "password": step.password
        }
    ];
    if (step.landingPage) {
        steps.landingPage = '/wp-admin/';
    }
    return steps;
};
login.description = "Login to the site";
login.builtin = true;
login.vars = createVarsConfig({
    username: {
        description: "Username",
        required: true,
        samples: ["admin"]
    },
    password: {
        description: "Password",
        required: true,
        samples: ["password"]
    },
    landingPage: {
        description: "Change landing page to wp-admin",
        type: "boolean",
        samples: ["true", "false"]
    }
});
//# sourceMappingURL=login.js.map