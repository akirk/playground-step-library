import { describe, it, expect } from 'vitest';
import { blockExamples } from './blockExamples.js';
import type { BlockExamplesStep } from './types.js';

describe('blockExamples', () => {
	it('should create a runPHP step with default values', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step);

		expect(result).toHaveLength(1);
		expect(result[0].step).toBe('runPHP');
		expect(result[0].code).toContain('wp_insert_post');
		expect(result[0].code).toContain('Block Examples');
		expect(result[0].code).toContain('publish');
	});

	it('should use custom post title', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples',
			postTitle: 'My Custom Block Examples'
		};

		const result = blockExamples(step);

		expect(result[0].code).toContain('My Custom Block Examples');
	});

	it('should filter by plugin slug', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples',
			pluginSlug: 'gutenberg'
		};

		const result = blockExamples(step);

		expect(result[0].code).toContain('gutenberg');
		expect(result[0].code).toContain("$plugin_slug = 'gutenberg'");
	});

	it('should always use publish status', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step);

		expect(result[0].code).toContain("'post_status'  => 'publish'");
	});

	it('should escape single quotes in post title', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples',
			postTitle: "Block's Examples"
		};

		const result = blockExamples(step);

		expect(result[0].code).toContain("Block\\'s Examples");
	});

	it('should search for block.json files', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step);

		expect(result[0].code).toContain('block.json');
		expect(result[0].code).toContain('RecursiveDirectoryIterator');
	});

	it('should parse block.json example attributes', () => {
		const step: BlockExamplesStep = {
			step: 'blockExamples'
		};

		const result = blockExamples(step);

		expect(result[0].code).toContain('$block_json[\'example\']');
		expect(result[0].code).toContain('$example[\'attributes\']');
	});
});
