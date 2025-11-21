import { describe, it, expect } from 'vitest';
import { addPost } from './addPost.js';
import type { AddPostStep } from './types.js';

describe('addPost', () => {
    describe('toV1()', () => {
        it('should create a basic post with new variable names', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Test Post',
            content: '<p>Test content</p>',
            type: 'post'
        };

        const result = addPost(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('runPHP');
        expect(result.steps[0].code).toContain("'post_title'   => 'Test Post'");
        expect(result.steps[0].code).toContain("'post_content' => '<p>Test content</p>'");
        expect(result.steps[0].code).toContain("'post_type'    => 'post'");
        expect(result.steps[0].code).toContain("'post_status'  => 'publish'");
    });

    it('should create a basic post with deprecated variable names (backward compatibility)', () => {
        const step: AddPostStep = {
            step: 'addPost',
            postTitle: 'Test Post',
            postContent: '<p>Test content</p>',
            postType: 'post'
        };

        const result = addPost(step).toV1();

        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('runPHP');
        expect(result.steps[0].code).toContain("'post_title'   => 'Test Post'");
        expect(result.steps[0].code).toContain("'post_content' => '<p>Test content</p>'");
        expect(result.steps[0].code).toContain("'post_type'    => 'post'");
        expect(result.steps[0].code).toContain("'post_status'  => 'publish'");
    });

    it('should handle custom post status', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Draft Post',
            content: '<p>Draft content</p>',
            type: 'post',
            status: 'draft'
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).toContain("'post_status'  => 'draft'");
    });

    it('should include post date when provided', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Scheduled Post',
            content: '<p>Future content</p>',
            type: 'post',
            date: '2024-12-25 10:00:00'
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).toContain("'post_date'    => date( 'Y-m-d H:i:s', strtotime( '2024-12-25 10:00:00' ) )");
    });

    it('should not include post date when not provided', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Regular Post',
            content: '<p>Regular content</p>',
            type: 'post'
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).not.toContain('post_date');
    });

    it('should set homepage when homepage flag is true', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Home Page',
            content: '<p>Welcome to our site</p>',
            type: 'page',
            homepage: true
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).toContain("update_option( 'page_on_front', $page_id )");
        expect(result.steps[0].code).toContain("update_option( 'show_on_front', 'page' )");
    });

    it('should not set homepage when homepage flag is false', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Regular Page',
            content: '<p>Just a page</p>',
            type: 'page',
            homepage: false
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).not.toContain("update_option( 'page_on_front'");
        expect(result.steps[0].code).not.toContain("update_option( 'show_on_front'");
    });

    it('should escape single quotes in title and content', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: "Title with 'single quotes'",
            content: "<p>Content with 'quotes' here</p>",
            type: 'post'
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).toContain("'post_title'   => 'Title with \\'single quotes\\''");
        expect(result.steps[0].code).toContain("'post_content' => '<p>Content with \\'quotes\\' here</p>'");
    });

    it('should escape single quotes in post date', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Test Post',
            content: '<p>Test content</p>',
            type: 'post',
            date: "2024-01-01 12:00:00 O'Clock"
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).toContain("'post_date'    => date( 'Y-m-d H:i:s', strtotime( '2024-01-01 12:00:00 O\\'Clock' ) )");
    });

    it('should handle custom post types', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'Custom Post',
            content: '<p>Custom content</p>',
            type: 'custom_type'
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).toContain("'post_type'    => 'custom_type'");
    });

    it('should prefer new variable names over deprecated ones', () => {
        const step: AddPostStep = {
            step: 'addPost',
            title: 'New Title',
            content: '<p>New Content</p>',
            type: 'post',
            status: 'draft',
            date: '2024-01-01',
            postTitle: 'Old Title',
            postContent: '<p>Old Content</p>',
            postType: 'page',
            postStatus: 'publish',
            postDate: '2025-01-01'
        };

        const result = addPost(step).toV1();

        expect(result.steps[0].code).toContain("'post_title'   => 'New Title'");
        expect(result.steps[0].code).toContain("'post_content' => '<p>New Content</p>'");
        expect(result.steps[0].code).toContain("'post_type'    => 'post'");
        expect(result.steps[0].code).toContain("'post_status'  => 'draft'");
        expect(result.steps[0].code).toContain("strtotime( '2024-01-01' )");
    });
    });

    describe('toV2()', () => {
        it('should create a post using content array', () => {
            const step: AddPostStep = {
                step: 'addPost',
                title: 'Test Post',
                content: '<p>Test content</p>',
                type: 'post'
            };

            const result = addPost(step).toV2();

            expect(result.version).toBe(2);
            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe('posts');
            expect(result.content[0].source.post_title).toBe('Test Post');
            expect(result.content[0].source.post_content).toBe('<p>Test content</p>');
            expect(result.content[0].source.post_type).toBe('post');
            expect(result.content[0].source.post_status).toBe('publish');
        });

        it('should include post_date when provided', () => {
            const step: AddPostStep = {
                step: 'addPost',
                title: 'Dated Post',
                content: '<p>Content</p>',
                type: 'post',
                date: '2024-12-25 10:00:00'
            };

            const result = addPost(step).toV2();

            expect(result.content[0].source.post_date).toBe('2024-12-25 10:00:00');
        });

        it('should set homepage with siteOptions and additionalStepsAfterExecution', () => {
            const step: AddPostStep = {
                step: 'addPost',
                title: 'Home Page',
                content: '<p>Welcome</p>',
                type: 'page',
                homepage: true
            };

            const result = addPost(step).toV2();

            expect(result.siteOptions).toBeDefined();
            expect(result.siteOptions.show_on_front).toBe('page');
            expect(result.additionalStepsAfterExecution).toHaveLength(1);
            expect(result.additionalStepsAfterExecution[0].step).toBe('runPHP');
        });

        it('should use deprecated variable names when new ones not provided', () => {
            const step: AddPostStep = {
                step: 'addPost',
                postTitle: 'Old Title',
                postContent: '<p>Old Content</p>',
                postType: 'post'
            };

            const result = addPost(step).toV2();

            expect(result.content[0].source.post_title).toBe('Old Title');
            expect(result.content[0].source.post_content).toBe('<p>Old Content</p>');
            expect(result.content[0].source.post_type).toBe('post');
        });

        it('should set landing page when landingPage is not false and postId is provided', () => {
            const step: AddPostStep = {
                step: 'addPost',
                title: 'Test Post',
                content: '<p>Test content</p>',
                type: 'post',
                postId: 1000
            };

            const result = addPost(step).toV2();

            expect(result.applicationOptions).toBeDefined();
            expect(result.applicationOptions['wordpress-playground'].landingPage).toBe('/wp-admin/post.php?post=1000&action=edit');
        });

        it('should not set landing page when landingPage is false', () => {
            const step: AddPostStep = {
                step: 'addPost',
                title: 'Test Post',
                content: '<p>Test content</p>',
                type: 'post',
                postId: 1000,
                landingPage: false
            };

            const result = addPost(step).toV2();

            expect(result.applicationOptions).toBeUndefined();
        });

        it('should not set landing page when postId is not provided', () => {
            const step: AddPostStep = {
                step: 'addPost',
                title: 'Test Post',
                content: '<p>Test content</p>',
                type: 'post'
            };

            const result = addPost(step).toV2();

            expect(result.applicationOptions).toBeUndefined();
        });
    });

    it('should have correct metadata', () => {
        expect(addPost.description).toBe('Add a post with title, content, type, status, and date.');
        expect(Array.isArray(addPost.vars)).toBe(true);
        expect(addPost.vars.length).toBeGreaterThan(6); // Now includes deprecated vars

        // Check new variable names
        const titleVar = addPost.vars.find(v => v.name === 'title');
        expect(titleVar).toBeDefined();
        expect(titleVar?.required).toBe(true);
        expect(titleVar?.deprecated).toBeFalsy();

        const typeVar = addPost.vars.find(v => v.name === 'type');
        expect(typeVar).toBeDefined();
        expect(typeVar?.required).toBe(true);
        expect(typeVar?.regex).toBe('^[a-z][a-z0-9_]+$');

        const statusVar = addPost.vars.find(v => v.name === 'status');
        expect(statusVar).toBeDefined();
        expect(statusVar?.required).toBe(false);

        const dateVar = addPost.vars.find(v => v.name === 'date');
        expect(dateVar).toBeDefined();
        expect(dateVar?.required).toBe(false);

        // Check deprecated variables
        const deprecatedTitleVar = addPost.vars.find(v => v.name === 'postTitle');
        expect(deprecatedTitleVar?.deprecated).toBe(true);

        const deprecatedTypeVar = addPost.vars.find(v => v.name === 'postType');
        expect(deprecatedTypeVar?.deprecated).toBe(true);
    });
});