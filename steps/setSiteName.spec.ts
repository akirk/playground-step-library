import { setSiteName } from './setSiteName.js';
import type { SetSiteNameStep } from './types.js';

describe('setSiteName', () => {
    it('should set site name and tagline', () => {
        const step: SetSiteNameStep = {
            step: 'setSiteName',
            sitename: 'My WordPress Site',
            tagline: 'Just another WordPress site'
        };

        const result = setSiteName(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('setSiteOptions');
        expect(result.steps[0].options).toBeDefined();
        expect(result.steps[0].options.blogname).toBe('My WordPress Site');
        expect(result.steps[0].options.blogdescription).toBe('Just another WordPress site');
    });

    it('should pass actual values to setSiteOptions', () => {
        const step: SetSiteNameStep = {
            step: 'setSiteName',
            sitename: 'Test Site',
            tagline: 'Testing playground'
        };

        const result = setSiteName(step).toV1();

        expect(result.steps[0].options.blogname).toBe('Test Site');
        expect(result.steps[0].options.blogdescription).toBe('Testing playground');
    });

    it('should work with empty values', () => {
        const step: SetSiteNameStep = {
            step: 'setSiteName',
            sitename: '',
            tagline: ''
        };

        const result = setSiteName(step).toV1();

        expect(result.steps[0].step).toBe('setSiteOptions');
        expect(result.steps[0].options.blogname).toBe('');
        expect(result.steps[0].options.blogdescription).toBe('');
    });

    it('should work with special characters in values', () => {
        const step: SetSiteNameStep = {
            step: 'setSiteName',
            sitename: 'Site "Name" & More',
            tagline: 'A tagline with <HTML> & symbols'
        };

        const result = setSiteName(step).toV1();

        expect(result.steps[0].options.blogname).toBe('Site "Name" & More');
        expect(result.steps[0].options.blogdescription).toBe('A tagline with <HTML> & symbols');
    });

    it('should output correct V2 siteOptions', () => {
        const step: SetSiteNameStep = {
            step: 'setSiteName',
            sitename: 'V2 Site',
            tagline: 'V2 Tagline'
        };

        const result = setSiteName(step).toV2();

        expect(result.version).toBe(2);
        expect(result.siteOptions).toBeDefined();
        expect(result.siteOptions!.blogname).toBe('V2 Site');
        expect(result.siteOptions!.blogdescription).toBe('V2 Tagline');
    });

    it('should have correct metadata', () => {
        expect(setSiteName.description).toBe('Set the site name and tagline.');
        expect(Array.isArray(setSiteName.vars)).toBe(true);
        expect(setSiteName.vars).toHaveLength(2);

        const sitenameVar = setSiteName.vars.find(v => v.name === 'sitename');
        expect(sitenameVar).toBeDefined();
        expect(sitenameVar.description).toBe('Name of the site');
        expect(sitenameVar.required).toBe(true);
        expect(sitenameVar.samples).toEqual(['Step Library Demo']);

        const taglineVar = setSiteName.vars.find(v => v.name === 'tagline');
        expect(taglineVar).toBeDefined();
        expect(taglineVar.description).toBe('What the site is about');
        expect(taglineVar.required).toBe(true);
        expect(taglineVar.samples).toEqual(['Trying out WordPress Playground.']);
    });

    it('should return a valid WordPress Playground step', () => {
        const step: SetSiteNameStep = {
            step: 'setSiteName',
            sitename: 'WordPress Site',
            tagline: 'My awesome site'
        };

        const result = setSiteName(step).toV1();

        // Validate the structure matches WordPress Playground step format
        expect(result.steps[0]).toHaveProperty('step');
        expect(result.steps[0]).toHaveProperty('options');
        expect(typeof result.steps[0].step).toBe('string');
        expect(typeof result.steps[0].options).toBe('object');
        expect(result.steps[0].options).not.toBeNull();
    });
});
