import { describe, it, expect } from 'vitest';
import { blockExamples } from './blockExamples.js';
import type { BlockExamplesStep } from './types.js';

describe('blockExamples', () => {
	it('should create a runPHP step with default values', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step).toV1();

		expect(result.steps).toHaveLength(1);
		expect(result.steps[0].step).toBe('runPHP');
		expect(result.steps[0].code).toContain('wp_insert_post');
		expect(result.steps[0].code).toContain('Block Examples');
		expect(result.steps[0].code).toContain('draft');
	});

	it('should use custom post title', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			postTitle: 'My Custom Block Examples'
		} };

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('My Custom Block Examples');
	});

	it('should filter by block namespace', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			blockNamespace: 'gutenberg'
		} };

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('gutenberg');
		expect(result.steps[0].code).toContain("$block_namespace = 'gutenberg'");
	});

	it('should always use draft status', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain("'post_status'  => 'draft'");
	});

	it('should escape single quotes in post title', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			postTitle: "Block's Examples"
		} };

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain("Block\\'s Examples");
	});

	it('should use WP_Block_Type_Registry', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('WP_Block_Type_Registry');
		expect(result.steps[0].code).toContain('get_all_registered');
	});

	it('should use serialize_block', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('serialize_block');
	});

	it('should set landing page by default', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step).toV1();

		expect(result.landingPage).toBe('/wp-admin/post.php?post=1000&action=edit');
	});

	it('should not set landing page when disabled', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			landingPage: false
		} };

		const result = blockExamples(step).toV1();

		expect(result.landingPage).toBeUndefined();
	});

	it('should use custom post ID', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			postId: 5000
		} };

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('$post_id = 5000');
		expect(result.landingPage).toBe('/wp-admin/post.php?post=5000&action=edit');
	});

	it('should not exclude core blocks by default', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('$exclude_core = false');
	});

	it('should exclude core blocks when excludeCore is true', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			excludeCore: true
		} };

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('$exclude_core = true');
		expect(result.steps[0].code).toContain("if ( $exclude_core && 0 === stripos( $block_name, 'core/' ) ) {");
	});

	it('should exclude core blocks when excludeCore is string "true"', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			excludeCore: 'true'
		} };

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('$exclude_core = true');
	});

	it('should include limit parameter', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples', vars: {
			limit: 10
		} };

		const result = blockExamples(step).toV1();

		expect(result.steps[0].code).toContain('$limit = 10');
	});
});
