const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const setSiteName = (step) => {
    return [
        {
            "step": "setSiteOptions",
            "options": {
                "blogname": "${sitename}",
                "blogdescription": "${tagline}",
            }
        }
    ];
};
setSiteName.description = "Set the site name and tagline.";
setSiteName.vars = createVarsConfig({
    sitename: {
        description: "Name of the site",
        required: true,
        samples: ["Step Library Demo"]
    },
    tagline: {
        description: "What the site is about",
        required: true,
        samples: ["Trying out WordPress Playground."]
    }
});
//# sourceMappingURL=setSiteName.js.map