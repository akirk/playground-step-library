import { installPlugin } from './installPlugin.js';
import type { InstallPluginStep, CompilationContext } from './types.js';

function createMockContext(): CompilationContext & { queryParams: Record<string, string> } {
    const queryParams: Record<string, string> = {};
    return {
        queryParams,
        setQueryParams( params: Record<string, string> ) {
            Object.assign( queryParams, params );
        },
        getSteps() {
            return [];
        },
        hasStep() {
            return false;
        }
    };
}

describe('installPlugin', () => {
    it('should install plugin from WordPress.org slug', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'hello-dolly'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('wordpress.org/plugins');
        expect(result.steps[0].pluginData.slug).toBe('hello-dolly');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should install plugin from WordPress.org URL', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://wordpress.org/plugins/woocommerce'
        } };

        const result = installPlugin(step).toV1();

        expect(result.steps[0].pluginData.slug).toBe('woocommerce');
        expect(result.steps[0].pluginData.resource).toBe('wordpress.org/plugins');
    });

    it('should install plugin from external HTTP URL', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://external-site.com/plugin.zip'
        } };

        const result = installPlugin(step).toV1();

        expect(result.steps[0].pluginData.resource).toBe('url');
        expect(result.steps[0].pluginData.url).toBe('https://external-site.com/plugin.zip');
    });

    it('should handle GitHub repository URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/blueprint-recorder'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/blueprint-recorder');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('HEAD');
        expect(result.steps[0].pluginData.refType).toBeUndefined();
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs without https prefix', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'akirk/blueprint-recorder'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/blueprint-recorder');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('HEAD');
        expect(result.steps[0].pluginData.refType).toBeUndefined();
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub release download URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/user/repo/releases/download/v1.0.0/plugin.zip'
        } };

        const result = installPlugin(step).toV1();

        // Since this calls githubPluginRelease, we just verify it's handled
        expect(Array.isArray(result.steps)).toBe(true);
    });

    it('should handle GitHub branch/directory URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/Automattic/wordpress-activitypub/tree/trunk'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/Automattic/wordpress-activitypub');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('trunk');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs with uppercase branch names', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/tree/BRANCHNAME'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('BRANCHNAME');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs with branch names containing slashes', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/tree/feature/new-thing'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('feature/new-thing');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs with branch containing slash and directory using double-slash separator', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/tree/feature/branch//some/directory'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.path).toBe('some/directory');
        expect(result.steps[0].pluginData.ref).toBe('feature/branch');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs with branch names with trailing slash', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/tree/feature/'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('feature');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs with two-part branch names', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/tree/feature/br'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('feature/br');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs with two-part branch names with trailing slash', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/tree/feature/br/'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].pluginData.ref).toBe('feature/br');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub URLs with simple branch and directory using double-slash', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/tree/feature//br'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.path).toBe('br');
        expect(result.steps[0].pluginData.ref).toBe('feature');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub branch/directory URLs with subdirectory', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/WordPress/gutenberg/tree/trunk/packages/components'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/WordPress/gutenberg');
        expect(result.steps[0].pluginData.path).toBe('packages/components');
        expect(result.steps[0].pluginData.ref).toBe('trunk');
        expect(result.steps[0].pluginData.refType).toBe('branch');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub PR URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/pull/559'
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.ref).toBe('refs/pull/559/head');
        expect(result.steps[0].pluginData.refType).toBe('refname');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should handle GitHub PR URLs with prs flag and add GitHub export parameters', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends/pull/559',
            prs: true
        } };

        const context = createMockContext();
        const result = installPlugin( step, context ).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
        expect(result.steps[0].pluginData.resource).toBe('git:directory');
        expect(result.steps[0].pluginData.url).toBe('https://github.com/akirk/friends');
        expect(result.steps[0].pluginData.ref).toBe('refs/pull/559/head');
        expect(result.steps[0].pluginData.refType).toBe('refname');
        expect(result.steps[0].pluginData.path).toBeUndefined();
        expect(result.steps[0].options.activate).toBe(true);
        expect(context.queryParams['gh-ensure-auth']).toBe('yes');
        expect(context.queryParams['ghexport-repo-url']).toBe('https://github.com/akirk/friends');
        expect(context.queryParams['ghexport-content-type']).toBe('plugin');
        expect(context.queryParams['ghexport-plugin']).toBe('friends');
        expect(context.queryParams['ghexport-playground-root']).toBe('/wordpress/wp-content/plugins/friends');
        expect(context.queryParams['ghexport-pr-action']).toBe('create');
        expect(context.queryParams['ghexport-allow-include-zip']).toBe('no');
    });

    it('should handle GitHub repository URLs with prs flag', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://github.com/akirk/friends',
            prs: true
        } };

        const context = createMockContext();
        const result = installPlugin( step, context ).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(context.queryParams['gh-ensure-auth']).toBe('yes');
        expect(context.queryParams['ghexport-repo-url']).toBe('https://github.com/akirk/friends');
        expect(context.queryParams['ghexport-content-type']).toBe('plugin');
    });

    it('should install plugin without permalink structure', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'hello-dolly'
        } };

        const result = installPlugin(step).toV1();

        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
    });

    it('should handle HTTP URLs with cors-proxy', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'http://external-site.com/plugin.zip'
        } };

        const result = installPlugin(step).toV1();

        // Note: Same regex bug as above - extracts 'http:' as slug
        expect(result.steps[0].pluginData.resource).toBe('url');
        expect(result.steps[0].pluginData.url).toBe('http://external-site.com/plugin.zip');
    });

    it('should extract slug from complex WordPress.org URLs', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: 'https://wordpress.org/plugins/friends/'
        } };

        const result = installPlugin(step).toV1();

        expect(result.steps[0].pluginData.slug).toBe('friends');
    });

    it('should have correct metadata', () => {
        expect(installPlugin.description).toBe('Install a plugin via WordPress.org or Git (GitHub, GitLab, Bitbucket, Codeberg, etc.).');
        expect(installPlugin.builtin).toBe(true);
        expect(Array.isArray(installPlugin.vars)).toBe(true);
        expect(installPlugin.vars).toHaveLength(2);

        const urlVar = installPlugin.vars.find(v => v.name === 'url');
        expect(urlVar).toBeDefined();
        expect(urlVar.description).toBe('URL of the plugin or WordPress.org slug.');
        expect(Array.isArray(urlVar.samples)).toBe(true);
        expect(urlVar.samples.length).toBeGreaterThan(0);

        const prsVar = installPlugin.vars.find(v => v.name === 'prs');
        expect(prsVar).toBeDefined();
        expect(prsVar.type).toBe('boolean');
        expect(typeof prsVar.show).toBe('function');
    });

    it('should handle empty or malformed URLs gracefully', () => {
        const step: InstallPluginStep = {
            step: 'installPlugin', vars: {
            url: ''
        } };

        const result = installPlugin(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installPlugin');
    });
});