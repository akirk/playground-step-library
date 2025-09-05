import { sampleContent } from './sampleContent.js';
import type { BlueprintStep } from '../types.js';

describe('sampleContent', () => {
    it('should create 5 sample content posts', () => {
        const result = sampleContent();
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(5);
        
        // All steps should be runPHP steps
        result.forEach((step, index) => {
            expect(step.step).toBe('runPHP');
            expect(step.code).toBeDefined();
            expect(typeof step.code).toBe('string');
            expect(step.code).toContain('wp_insert_post');
            expect(step.code).toContain('post_status');
            expect(step.code).toContain('publish');
        });
    });

    it('should create posts with correct titles', () => {
        const result = sampleContent();
        
        expect(result[0].code).toContain('Hello Sample Content');
        expect(result[1].code).toContain('Second Sample Content');
        expect(result[2].code).toContain('Third Sample Content');
        expect(result[3].code).toContain('Fourth Sample Content');
        expect(result[4].code).toContain('Fifth Sample Content');
    });

    it('should include WordPress require statement in all steps', () => {
        const result = sampleContent();
        
        result.forEach(step => {
            expect(step.code).toContain('require_once \'/wordpress/wp-load.php\'');
        });
    });

    it('should set all posts to publish status', () => {
        const result = sampleContent();
        
        result.forEach(step => {
            expect(step.code).toContain('\'post_status\' => \'publish\'');
        });
    });

    it('should use proper PHP syntax', () => {
        const result = sampleContent();
        
        result.forEach(step => {
            expect(step.code).toMatch(/^<\?php/);
            expect(step.code).toMatch(/\?>$/);
            expect(step.code).toContain('wp_insert_post(array(');
        });
    });

    it('should have unique titles for each post', () => {
        const result = sampleContent();
        
        const titles = result.map(step => {
            const match = step.code.match(/'post_title' => '([^']+)'/);
            return match ? match[1] : null;
        });
        
        expect(titles).toHaveLength(5);
        expect(new Set(titles).size).toBe(5); // All titles should be unique
        expect(titles.every(title => title !== null)).toBe(true);
    });

    it('should not require any parameters', () => {
        // Function should work without any parameters
        expect(() => sampleContent()).not.toThrow();
        
        const result = sampleContent();
        expect(result).toHaveLength(5);
    });

    it('should have correct metadata', () => {
        expect(sampleContent.count).toBe(5);
        expect(sampleContent.description).toBe('Inserts sample pages to the site.');
    });

    it('should return valid WordPress Playground steps', () => {
        const result = sampleContent();
        
        result.forEach(step => {
            // Validate the structure matches WordPress Playground step format
            expect(step).toHaveProperty('step');
            expect(step).toHaveProperty('code');
            expect(typeof step.step).toBe('string');
            expect(typeof step.code).toBe('string');
            expect(step.step).toBe('runPHP');
        });
    });

    it('should create posts with proper WordPress function calls', () => {
        const result = sampleContent();
        
        result.forEach(step => {
            expect(step.code).toContain('wp_insert_post');
            expect(step.code).toContain('array(');
            expect(step.code).toContain('post_title');
            expect(step.code).toContain('post_status');
        });
    });

    it('should have consistent PHP code structure', () => {
        const result = sampleContent();
        
        result.forEach(step => {
            // Each step should follow the same pattern
            expect(step.code).toMatch(
                /^<\?php require_once '\/wordpress\/wp-load\.php'; wp_insert_post\(array\('post_title' => '[^']+', 'post_status' => 'publish'\)\); \?>$/
            );
        });
    });
});