import { githubPlugin } from './githubPlugin.js';
import { githubPluginRelease } from './githubPluginRelease.js';
export const installPlugin = (step) => {
    let urlTest = /^(?:https:\/\/github.com\/)?(?<org>[^\/]+)\/(?<repo>[^\/]+)(\/tree\/(?<branch>[^\/]+)(?<directory>(?:\/[^\/]+)*))?/.exec(step.url);
    if (urlTest) {
        const releaseMatch = step.url.match(/\/releases\/download\/(?<version>[^\/]+)\/(?<asset>[^\/]+)$/);
        if (releaseMatch) {
            return githubPluginRelease({
                step: 'githubPluginRelease',
                repo: urlTest.groups.org + '/' + urlTest.groups.repo,
                release: releaseMatch.groups.version,
                filename: releaseMatch.groups.asset
            });
        }
        return githubPlugin({
            step: 'githubPlugin',
            url: step.url,
            prs: step.prs
        });
    }
    let plugin = step.url;
    urlTest = /^https:\/\/wordpress.org\/plugins\/(?<slug>[^\/]+)/.exec(step.url);
    if (urlTest) {
        plugin = urlTest.groups.slug;
    }
    const steps = [
        {
            "step": "installPlugin",
            "pluginData": {
                "resource": "wordpress.org/plugins",
                "slug": plugin
            },
            "options": {
                "activate": true
            }
        }
    ];
    if (plugin.match(/^https?:/)) {
        steps[0].pluginData = {
            resource: "url",
            url: 'https://playground.wordpress.net/cors-proxy.php?' + plugin
        };
    }
    if (step?.permalink) {
        steps.unshift({
            "step": "setSiteOptions",
            "options": {
                "permalink_structure": "/%postname%/"
            }
        });
    }
    return steps;
};
installPlugin.description = "Install a plugin via WordPress.org or Github";
installPlugin.builtin = true;
installPlugin.vars = Object.entries({
    url: {
        description: "URL of the plugin or WordPress.org slug.",
        required: true,
        samples: ["hello-dolly", 'https://wordpress.org/plugins/friends', 'woocommerce', 'create-block-theme', "https://github.com/akirk/blueprint-recorder", "https://github.com/Automattic/wordpress-activitypub/tree/trunk"]
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
    },
    permalink: {
        description: "Requires a permalink structure",
        type: "boolean"
    }
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=installPlugin.js.map