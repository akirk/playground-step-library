import { describe, it, expect } from 'vitest';
import { addPage } from './addPage.js';
import type { AddPageStep } from './types.js';

describe('addPage', () => {
  it('should create a basic page with new variable names', () => {
    const step: AddPageStep = {
      step: 'addPage',
      title: 'Test Page',
      content: '<p>Test content</p>'
    };

    const result = addPage(step).toV1();

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toEqual({
      step: 'runPHP',
      code: expect.stringContaining("'post_title'   => 'Test Page'"),
      progress: {
        caption: 'addPage: Test Page'
      }
    });
    expect(result.steps[0].code).toContain("'post_content' => '<p>Test content</p>'");
    expect(result.steps[0].code).toContain("'post_type'    => 'page'");
    expect(result.steps[0].code).not.toContain('update_option');
  });

  it('should create a basic page with deprecated variable names (backward compatibility)', () => {
    const step: AddPageStep = {
      step: 'addPage',
      postTitle: 'Test Page',
      postContent: '<p>Test content</p>'
    };

    const result = addPage(step).toV1();

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0]).toEqual({
      step: 'runPHP',
      code: expect.stringContaining("'post_title'   => 'Test Page'"),
      progress: {
        caption: 'addPage: Test Page'
      }
    });
    expect(result.steps[0].code).toContain("'post_content' => '<p>Test content</p>'");
    expect(result.steps[0].code).toContain("'post_type'    => 'page'");
    expect(result.steps[0].code).not.toContain('update_option');
  });

  it('should set as homepage when homepage flag is true', () => {
    const step: AddPageStep = {
      step: 'addPage',
      title: 'Home Page',
      content: '<p>Welcome home</p>',
      homepage: true
    };

    const result = addPage(step).toV1();

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].code).toContain("update_option( 'page_on_front', $page_id )");
    expect(result.steps[0].code).toContain("update_option( 'show_on_front', 'page' )");
  });

  it('should escape single quotes in title and content', () => {
    const step: AddPageStep = {
      step: 'addPage',
      title: "John's Page",
      content: "<p>Here's some content</p>"
    };

    const result = addPage(step).toV1();

    expect(result.steps[0].code).toContain("'post_title'   => 'John\\'s Page'");
    expect(result.steps[0].code).toContain("'post_content' => '<p>Here\\'s some content</p>'");
  });

  it('should prefer new variable names over deprecated ones', () => {
    const step: AddPageStep = {
      step: 'addPage',
      title: 'New Title',
      content: '<p>New Content</p>',
      postTitle: 'Old Title',
      postContent: '<p>Old Content</p>'
    };

    const result = addPage(step).toV1();

    expect(result.steps[0].code).toContain("'post_title'   => 'New Title'");
    expect(result.steps[0].code).toContain("'post_content' => '<p>New Content</p>'");
  });

  it('should have proper metadata', () => {
    expect(addPage.description).toBe("Add a page with title and content.");
    expect(addPage.vars.length).toBeGreaterThan(3); // Now includes deprecated vars

    const titleVar = addPage.vars.find(v => v.name === 'title');
    expect(titleVar?.required).toBe(true);
    expect(titleVar?.deprecated).toBeFalsy();

    const deprecatedTitleVar = addPage.vars.find(v => v.name === 'postTitle');
    expect(deprecatedTitleVar?.deprecated).toBe(true);

    const homepageVar = addPage.vars.find(v => v.name === 'homepage');
    expect(homepageVar?.type).toBe('boolean');
  });
});