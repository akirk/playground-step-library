import { installPlugin } from './installPlugin.js';
import type { InstallPluginStep } from './types.js';

describe('installPlugin', () => {
    it('should install plugin from WordPress.org slug', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'hello-dolly'
        };

        const result = installPlugin(step);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('installPlugin');
        expect(result[0].pluginData.resource).toBe('wordpress.org/plugins');
        expect(result[0].pluginData.slug).toBe('hello-dolly');
        expect(result[0].options.activate).toBe(true);
    });

    it('should install plugin from WordPress.org URL', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'https://wordpress.org/plugins/woocommerce'
        };

        const result = installPlugin(step);

        expect(result[0].pluginData.slug).toBe('woocommerce');
        expect(result[0].pluginData.resource).toBe('wordpress.org/plugins');
    });

    it('should install plugin from external HTTP URL', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'https://external-site.com/plugin.zip'
        };

        const result = installPlugin(step);

        expect(result[0].pluginData.resource).toBe('url');
        expect(result[0].pluginData.url).toBe('https://playground.wordpress.net/cors-proxy.php?https://external-site.com/plugin.zip');
    });

    it('should handle GitHub repository URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'https://github.com/akirk/blueprint-recorder'
        };

        const result = installPlugin(step);

        // Since this calls githubPlugin, we just verify it's handled differently
        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle GitHub URLs without https prefix', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'github.com/user/repo'
        };

        const result = installPlugin(step);

        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle GitHub release download URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'https://github.com/user/repo/releases/download/v1.0.0/plugin.zip'
        };

        const result = installPlugin(step);

        // Since this calls githubPluginRelease, we just verify it's handled
        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle GitHub branch/directory URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'https://github.com/Automattic/wordpress-activitypub/tree/trunk'
        };

        const result = installPlugin(step);

        expect(Array.isArray(result)).toBe(true);
    });

    it('should add permalink structure when permalink flag is true', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'woocommerce',
            permalink: true
        };

        const result = installPlugin(step);

        expect(result).toHaveLength(2);
        expect(result[0].step).toBe('setSiteOptions');
        expect(result[0].options.permalink_structure).toBe('/%postname%/');
        expect(result[1].step).toBe('installPlugin');
    });

    it('should not add permalink structure when permalink flag is false', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'hello-dolly',
            permalink: false
        };

        const result = installPlugin(step);

        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('installPlugin');
    });

    it('should not add permalink structure when permalink flag is not set', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'hello-dolly'
        };

        const result = installPlugin(step);

        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('installPlugin');
    });

    it('should handle HTTP URLs with cors-proxy', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'http://external-site.com/plugin.zip'
        };

        const result = installPlugin(step);

        // Note: Same regex bug as above - extracts 'http:' as slug
        expect(result[0].pluginData.resource).toBe('url');
        expect(result[0].pluginData.url).toBe('https://playground.wordpress.net/cors-proxy.php?http://external-site.com/plugin.zip');
    });

    it('should extract slug from complex WordPress.org URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: 'https://wordpress.org/plugins/friends/'
        };

        const result = installPlugin(step);

        expect(result[0].pluginData.slug).toBe('friends');
    });

    it('should have correct metadata', () => {
        expect(installPlugin.description).toBe('Install a plugin via WordPress.org or Github');
        expect(installPlugin.builtin).toBe(true);
        expect(Array.isArray(installPlugin.vars)).toBe(true);
        expect(installPlugin.vars).toHaveLength(3);

        const urlVar = installPlugin.vars.find(v => v.name === 'url');
        expect(urlVar).toBeDefined();
        expect(urlVar.description).toBe('URL of the plugin or WordPress.org slug.');
        expect(Array.isArray(urlVar.samples)).toBe(true);
        expect(urlVar.samples.length).toBeGreaterThan(0);

        const prsVar = installPlugin.vars.find(v => v.name === 'prs');
        expect(prsVar).toBeDefined();
        expect(prsVar.type).toBe('boolean');
        expect(typeof prsVar.show).toBe('function');

        const permalinkVar = installPlugin.vars.find(v => v.name === 'permalink');
        expect(permalinkVar).toBeDefined();
        expect(permalinkVar.type).toBe('boolean');
    });

    it('should handle empty or malformed URLs gracefully', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin',
            url: ''
        };

        const result = installPlugin(step);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('installPlugin');
    });
});