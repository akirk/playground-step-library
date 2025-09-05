import { setSiteName } from './setSiteName.js';
import type { BlueprintStep } from '../types.js';

describe('setSiteName', () => {
    it('should set site name and tagline', () => {
        const step: BlueprintStep = {
            step: 'setSiteName',
            vars: {
                sitename: 'My WordPress Site',
                tagline: 'Just another WordPress site'
            }
        };
        
        const result = setSiteName(step);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('setSiteOptions');
        expect(result[0].options).toBeDefined();
        expect(result[0].options.blogname).toBe('${sitename}');
        expect(result[0].options.blogdescription).toBe('${tagline}');
    });

    it('should return setSiteOptions step with template variables', () => {
        const step: BlueprintStep = {
            step: 'setSiteName',
            vars: {
                sitename: 'Test Site',
                tagline: 'Testing playground'
            }
        };
        
        const result = setSiteName(step);
        
        // The step should use template variables that will be substituted later
        expect(result[0].options.blogname).toBe('${sitename}');
        expect(result[0].options.blogdescription).toBe('${tagline}');
    });

    it('should work with empty values', () => {
        const step: BlueprintStep = {
            step: 'setSiteName',
            vars: {
                sitename: '',
                tagline: ''
            }
        };
        
        const result = setSiteName(step);
        
        expect(result[0].step).toBe('setSiteOptions');
        expect(result[0].options.blogname).toBe('${sitename}');
        expect(result[0].options.blogdescription).toBe('${tagline}');
    });

    it('should work with special characters in variables', () => {
        const step: BlueprintStep = {
            step: 'setSiteName',
            vars: {
                sitename: 'Site "Name" & More',
                tagline: 'A tagline with <HTML> & symbols'
            }
        };
        
        const result = setSiteName(step);
        
        // Template variables should remain unchanged
        expect(result[0].options.blogname).toBe('${sitename}');
        expect(result[0].options.blogdescription).toBe('${tagline}');
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
        const step: BlueprintStep = {
            step: 'setSiteName',
            vars: {
                sitename: 'WordPress Site',
                tagline: 'My awesome site'
            }
        };
        
        const result = setSiteName(step);
        
        // Validate the structure matches WordPress Playground step format
        expect(result[0]).toHaveProperty('step');
        expect(result[0]).toHaveProperty('options');
        expect(typeof result[0].step).toBe('string');
        expect(typeof result[0].options).toBe('object');
        expect(result[0].options).not.toBeNull();
    });
});