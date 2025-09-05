import { describe, it, expect } from 'vitest';
import { addPage } from './addPage.js';
import type { AddPageStep } from './types.js';

describe('addPage', () => {
  it('should create a basic page', () => {
    const step: AddPageStep = {
      step: 'addPage',
      postTitle: 'Test Page',
      postContent: '<p>Test content</p>'
    };

    const result = addPage(step);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      step: 'runPHP',
      code: expect.stringContaining("'post_title'   => 'Test Page'")
    });
    expect(result[0].code).toContain("'post_content' => '<p>Test content</p>'");
    expect(result[0].code).toContain("'post_type'    => 'page'");
    expect(result[0].code).not.toContain('update_option');
  });

  it('should set as homepage when homepage flag is true', () => {
    const step: AddPageStep = {
      step: 'addPage',
      postTitle: 'Home Page',
      postContent: '<p>Welcome home</p>',
      homepage: true
    };

    const result = addPage(step);

    expect(result).toHaveLength(1);
    expect(result[0].code).toContain("update_option( 'page_on_front', $page_id )");
    expect(result[0].code).toContain("update_option( 'show_on_front', 'page' )");
  });

  it('should escape single quotes in title and content', () => {
    const step: AddPageStep = {
      step: 'addPage',
      postTitle: "John's Page",
      postContent: "<p>Here's some content</p>"
    };

    const result = addPage(step);

    expect(result[0].code).toContain("'post_title'   => 'John\\'s Page'");
    expect(result[0].code).toContain("'post_content' => '<p>Here\\'s some content</p>'");
  });

  it('should have proper metadata', () => {
    expect(addPage.description).toBe("Add a page with title and content.");
    expect(addPage.vars).toHaveLength(3);

    const titleVar = addPage.vars.find(v => v.name === 'postTitle');
    expect(titleVar?.required).toBe(true);

    const homepageVar = addPage.vars.find(v => v.name === 'homepage');
    expect(homepageVar?.type).toBe('boolean');
  });
});