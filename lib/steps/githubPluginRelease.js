const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const githubPluginRelease = (step) => {
    const repoTest = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/.exec(step.repo);
    if (!repoTest) {
        return [];
    }
    const repo = repoTest[1] + "/" + repoTest[2];
    const tag = step.release;
    const filename = step.filename;
    const dir = filename.replace(/\.zip$/, '').replace(/[^a-z0-9-]+/g, '-').toLowerCase();
    const options = {
        activate: true,
    };
    const outSteps = [
        {
            "step": "unzip",
            "zipFile": {
                "resource": "url",
                "url": `https://github-proxy.com/proxy/?repo=${repo}&release=${tag}&asset=${filename}`
            },
            "extractToPath": "/wordpress/wp-content/plugins/" + dir
        },
        {
            "step": "activatePlugin",
            "pluginPath": "/wordpress/wp-content/plugins/" + dir
        }
    ];
    return outSteps;
};
githubPluginRelease.description = "Install a specific plugin release from a Github repository.";
githubPluginRelease.vars = createVarsConfig({
    repo: {
        description: "The plugin resides in this GitHub repository.",
        samples: ["ryanwelcher/interactivity-api-todomvc"]
    },
    release: {
        description: "The release slug.",
        samples: ["v0.1.3"]
    },
    filename: {
        description: "Which filename to use.",
        samples: [" to-do-mvc.zip "]
    }
});
//# sourceMappingURL=githubPluginRelease.js.map