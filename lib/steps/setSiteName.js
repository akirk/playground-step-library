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
setSiteName.vars = Object.entries({
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
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=setSiteName.js.map