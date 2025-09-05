import { githubTheme } from './githubTheme.js';
const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const installTheme = (step) => {
    let urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec(step.url);
    if (urlTest) {
        return githubTheme({
            step: 'githubTheme',
            url: step.url,
            prs: step.prs
        });
    }
    let theme = step.url;
    urlTest = /^https:\/\/wordpress.org\/themes\/(?<slug>[^\/]+)/.exec(step.url);
    if (urlTest) {
        theme = urlTest.groups.slug;
    }
    if (!theme) {
        return [];
    }
    const steps = [
        {
            "step": "installTheme",
            "themeData": {
                "resource": "wordpress.org/themes",
                "slug": theme
            },
            "options": {
                "activate": true
            }
        }
    ];
    if (theme.match(/^https?:/)) {
        steps[0].themeData = {
            resource: "url",
            url: 'https://playground.wordpress.net/cors-proxy.php?' + theme
        };
    }
    return steps;
};
installTheme.description = "Install a theme";
installTheme.builtin = true;
installTheme.vars = createVarsConfig({
    url: {
        description: "URL of the theme or WordPress.org slug",
        required: true,
        samples: ["pendant", "https://github.com/richtabor/kanso", "ndiego/nautilus", "https://github.com/Automattic/themes/tree/trunk/aether", "link-folio"]
    },
    prs: {
        description: "Add support for submitting Github Requests.",
        show: function (step) {
            const url = step.querySelector('input[name=url]')?.value;
            console.log(url, url.match(/^https:\/\/github.com\//));
            return url && url.match(/^https:\/\/github.com\//);
        },
        type: "boolean",
        samples: ["false", "true"]
    }
});
//# sourceMappingURL=installTheme.js.map