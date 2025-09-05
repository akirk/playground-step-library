const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const setLandingPage = (step) => {
    const steps = [];
    steps.landingPage = step.landingPage;
    return steps;
};
setLandingPage.description = "Set the landing page.";
setLandingPage.vars = createVarsConfig({
    landingPage: {
        description: "The relative URL for the landing page",
        required: true,
        samples: ["/", "/wp-admin/", "/wp-admin/post-new.php", "/wp-admin/post-new.php?post_type=page"]
    }
});
//# sourceMappingURL=setLandingPage.js.map