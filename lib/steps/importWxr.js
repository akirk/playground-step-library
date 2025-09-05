const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const importWxr = (step) => {
    if (!step.url || !step.url.match(/^https?:/)) {
        return [];
    }
    const url = step.corsProxy ? 'https://playground.wordpress.net/cors-proxy.php?' + step.url : step.url;
    return [
        {
            "step": "importWxr",
            "file": {
                "resource": "url",
                url
            }
        }
    ];
};
importWxr.description = "Import a WXR from a URL.";
importWxr.builtin = true;
importWxr.vars = createVarsConfig({
    url: {
        description: "URL of a WXR file",
        required: true,
        samples: [""]
    },
    corsProxy: {
        description: "Use a cors proxy for the request",
        required: true,
        type: "boolean",
        samples: ["true", "false"]
    }
});
//# sourceMappingURL=importWxr.js.map