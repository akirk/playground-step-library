import { installTheme } from './installTheme.js';
import type { InstallThemeStep } from './types.js';

describe('installTheme', () => {
    it('should install theme from WordPress.org slug', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'pendant'
        };

        const result = installTheme(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('installTheme');
        expect(result.steps[0].themeData.resource).toBe('wordpress.org/themes');
        expect(result.steps[0].themeData.slug).toBe('pendant');
        expect(result.steps[0].options.activate).toBe(true);
    });

    it('should install theme from WordPress.org URL', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'https://wordpress.org/themes/twentytwentyfour'
        };

        const result = installTheme(step).toV1();

        expect(result.steps[0].themeData.slug).toBe('twentytwentyfour');
        expect(result.steps[0].themeData.resource).toBe('wordpress.org/themes');
    });

    it('should handle GitHub repository URLs', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'https://github.com/richtabor/kanso'
        };

        const result = installTheme(step).toV1();

        // Since this calls githubTheme, we just verify it's handled
        expect(Array.isArray(result.steps)).toBe(true);
    });

    it('should handle GitHub URLs without https prefix', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'ndiego/nautilus'
        };

        const result = installTheme(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
    });

    it('should handle GitHub branch URLs', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'https://github.com/Automattic/themes/tree/trunk/aether'
        };

        const result = installTheme(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
    });

    it('should install theme from external HTTP URL', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'https://external-site.com/theme.zip'
        };

        const result = installTheme(step).toV1();

        // Note: Same regex issue as installPlugin - extracts 'https:' as slug
        // but since theme.match(/^https?:/) is true, it gets treated as external URL
        expect(result.steps[0].themeData.resource).toBe('url');
        expect(result.steps[0].themeData.url).toBe('https://external-site.com/theme.zip');
    });

    it('should handle HTTP URLs with cors-proxy', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'http://external-site.com/theme.zip'
        };

        const result = installTheme(step).toV1();

        // Note: Same regex bug - extracts 'http:' as slug
        expect(result.steps[0].themeData.resource).toBe('url');
        expect(result.steps[0].themeData.url).toBe('http://external-site.com/theme.zip');
    });

    it('should return empty array when url is empty', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: ''
        };

        const result = installTheme(step).toV1();

        expect(result).toEqual([]);
    });

    it('should extract slug from WordPress.org URLs with trailing slash', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'https://wordpress.org/themes/link-folio/'
        };

        const result = installTheme(step).toV1();

        expect(result.steps[0].themeData.slug).toBe('link-folio');
    });

    it('should handle themes without protocol prefix correctly', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'simple-theme-name'
        };

        const result = installTheme(step).toV1();

        expect(result.steps[0].themeData.slug).toBe('simple-theme-name');
        expect(result.steps[0].themeData.resource).toBe('wordpress.org/themes');
    });

    it('should have correct metadata', () => {
        expect(installTheme.description).toBe('Install a theme via WordPress.org or Github.');
        expect(installTheme.builtin).toBe(true);
        expect(Array.isArray(installTheme.vars)).toBe(true);
        expect(installTheme.vars).toHaveLength(2);

        const urlVar = installTheme.vars.find(v => v.name === 'url');
        expect(urlVar).toBeDefined();
        expect(urlVar.description).toBe('URL of the theme or WordPress.org slug');
        expect(urlVar.required).toBe(true);
        expect(Array.isArray(urlVar.samples)).toBe(true);
        expect(urlVar.samples.length).toBeGreaterThan(0);

        const prsVar = installTheme.vars.find(v => v.name === 'prs');
        expect(prsVar).toBeDefined();
        expect(prsVar.type).toBe('boolean');
        expect(typeof prsVar.show).toBe('function');
    });

    it('should return a valid WordPress Playground step', () => {
        const step: InstallThemeStep = {
            step: 'installTheme',
            url: 'twentytwentyfour'
        };

        const result = installTheme(step).toV1();

        // Validate the structure matches WordPress Playground step format
        expect(result.steps[0]).toHaveProperty('step');
        expect(result.steps[0]).toHaveProperty('themeData');
        expect(result.steps[0]).toHaveProperty('options');
        expect(typeof result.steps[0].step).toBe('string');
        expect(typeof result.steps[0].themeData).toBe('object');
        expect(typeof result.steps[0].options).toBe('object');
        expect(result.steps[0].themeData).not.toBeNull();
        expect(result.steps[0].options).not.toBeNull();
    });
});