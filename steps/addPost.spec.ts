import { addPost } from './addPost.js';
import type { BlueprintStep } from '../types.js';

describe('addPost', () => {
    it('should create a basic post', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Test Post',
                postContent: '<p>Test content</p>',
                postType: 'post'
            }
        };
        
        const result = addPost(step);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('runPHP');
        expect(result[0].code).toContain("'post_title'   => 'Test Post'");
        expect(result[0].code).toContain("'post_content' => '<p>Test content</p>'");
        expect(result[0].code).toContain("'post_type'    => 'post'");
        expect(result[0].code).toContain("'post_status'  => 'publish'");
    });

    it('should handle custom post status', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Draft Post',
                postContent: '<p>Draft content</p>',
                postType: 'post',
                postStatus: 'draft'
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).toContain("'post_status'  => 'draft'");
    });

    it('should include post date when provided', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Scheduled Post',
                postContent: '<p>Future content</p>',
                postType: 'post',
                postDate: '2024-12-25 10:00:00'
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).toContain("'post_date'    => strtotime('2024-12-25 10:00:00')");
    });

    it('should not include post date when not provided', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Regular Post',
                postContent: '<p>Regular content</p>',
                postType: 'post'
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).not.toContain('post_date');
    });

    it('should set homepage when homepage flag is true', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Home Page',
                postContent: '<p>Welcome to our site</p>',
                postType: 'page',
                homepage: true
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).toContain("update_option( 'page_on_front', $page_id )");
        expect(result[0].code).toContain("update_option( 'show_on_front', 'page' )");
    });

    it('should not set homepage when homepage flag is false', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Regular Page',
                postContent: '<p>Just a page</p>',
                postType: 'page',
                homepage: false
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).not.toContain("update_option( 'page_on_front'");
        expect(result[0].code).not.toContain("update_option( 'show_on_front'");
    });

    it('should escape single quotes in title and content', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: "Title with 'single quotes'",
                postContent: "<p>Content with 'quotes' here</p>",
                postType: 'post'
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).toContain("'post_title'   => 'Title with \\'single quotes\\''");
        expect(result[0].code).toContain("'post_content' => '<p>Content with \\'quotes\\' here</p>'");
    });

    it('should escape single quotes in post date', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Test Post',
                postContent: '<p>Test content</p>',
                postType: 'post',
                postDate: "2024-01-01 12:00:00 O'Clock"
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).toContain("'post_date'    => strtotime('2024-01-01 12:00:00 O\\'Clock')");
    });

    it('should handle custom post types', () => {
        const step: BlueprintStep = {
            step: 'addPost',
            vars: {
                postTitle: 'Custom Post',
                postContent: '<p>Custom content</p>',
                postType: 'custom_type'
            }
        };
        
        const result = addPost(step);
        
        expect(result[0].code).toContain("'post_type'    => 'custom_type'");
    });

    it('should have correct metadata', () => {
        expect(addPost.description).toBe('Add a post.');
        expect(Array.isArray(addPost.vars)).toBe(true);
        expect(addPost.vars).toHaveLength(6); // 5 vars + 1 button
        
        const postTitleVar = addPost.vars.find(v => v.name === 'postTitle');
        expect(postTitleVar).toBeDefined();
        expect(postTitleVar.required).toBe(true);
        
        const postTypeVar = addPost.vars.find(v => v.name === 'postType');
        expect(postTypeVar).toBeDefined();
        expect(postTypeVar.required).toBe(true);
        expect(postTypeVar.regex).toBe('^[a-z][a-z0-9_]+$');
        
        const postStatusVar = addPost.vars.find(v => v.name === 'postStatus');
        expect(postStatusVar).toBeDefined();
        expect(postStatusVar.required).toBe(false);
        
        const postDateVar = addPost.vars.find(v => v.name === 'postDate');
        expect(postDateVar).toBeDefined();
        expect(postDateVar.required).toBe(false);
    });
});