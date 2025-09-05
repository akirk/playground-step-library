export const githubPlugin = (step) => {
    const urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec(step.url);
    if (!urlTest) {
        return [];
    }
    const repo = urlTest.groups.org + "/" + urlTest.groups.repo;
    const branch = urlTest.groups.branch || "main";
    if (!/^[a-z0-9-]+$/.test(branch)) {
        return [];
    }
    let url = `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`;
    const directory = (urlTest.groups.directory || '').replace(/\/+$/, '').replace(/^\/+/, '');
    let dirBasename;
    if (directory) {
        url += '&directory=' + directory;
        dirBasename = directory.split('/').pop();
    }
    const outStep = {
        "step": "installPlugin",
        "pluginData": {
            "resource": "url",
            url
        },
        options: {
            activate: false,
        }
    };
    if (step.prs) {
        outStep.queryParams = {
            'gh-ensure-auth': 'yes',
            'ghexport-repo-url': 'https://github.com/' + repo,
            'ghexport-content-type': 'plugin',
            'ghexport-plugin': urlTest.groups?.repo + '-' + branch,
            'ghexport-playground-root': '/wordpress/wp-content/plugins/' + urlTest.groups?.repo + '-' + branch,
            'ghexport-pr-action': 'create',
            'ghexport-allow-include-zip': 'no',
        };
    }
    const outSteps = [outStep];
    if (directory && directory !== dirBasename) {
        // if its a subsub directory, move the lowest directory into wp-content/plugins
        outSteps.push({
            "step": "mv",
            "fromPath": "/wordpress/wp-content/plugins/" + directory,
            "toPath": "/wordpress/wp-content/plugins/" + dirBasename
        });
        outSteps.push({
            "step": "activatePlugin",
            "pluginPath": "/wordpress/wp-content/plugins/" + dirBasename
        });
    }
    else {
        false && outSteps.push({
            "step": "activatePlugin",
            "pluginPath": "/wordpress/wp-content/plugins/" + (urlTest?.groups?.repo || 'unknown') + '-' + branch + '/' + (urlTest?.groups?.repo || 'unknown') + '.php'
        });
    }
    return outSteps;
};
githubPlugin.description = "Install a plugin from a Github repository.";
githubPlugin.vars = Object.entries({
    url: {
        description: "Github URL of the plugin.",
        samples: ["https://github.com/akirk/blueprint-recorder"]
    },
    prs: {
        description: "Add support for submitting Github Requests.",
        type: "boolean",
        samples: ["false", "true"]
    }
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=githubPlugin.js.map