import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	compressState,
	uncompressState,
	extractStepDataFromElement,
	type StepConfig,
	type CompressedState
} from './blueprint-compiler';

describe('blueprint-compiler', () => {
	describe('compressState', () => {
		it('should compress empty steps to empty string', () => {
			const result = compressState([], {});
			expect(result).toBe('');
		});

		it('should compress single step', () => {
			const steps: StepConfig[] = [
				{ step: 'login', username: 'admin' }
			];
			const result = compressState(steps, {});
			expect(result).toBeTruthy();
			expect(typeof result).toBe('string');
		});

		it('should include title in compressed state', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { title: 'My Blueprint' });
			const decompressed = uncompressState(result);
			expect(decompressed.title).toBe('My Blueprint');
		});

		it('should not include title if not provided', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, {});
			const decompressed = uncompressState(result);
			expect(decompressed.title).toBeUndefined();
		});

		it('should include autosave option', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { autosave: '5' });
			const decompressed = uncompressState(result);
			expect(decompressed.autosave).toBe('5');
		});

		it('should include playground URL if not default', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { playground: 'custom.playground.com' });
			const decompressed = uncompressState(result);
			expect(decompressed.playground).toBe('custom.playground.com');
		});

		it('should not include default playground URL', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { playground: 'playground.wordpress.net' });
			const decompressed = uncompressState(result);
			expect(decompressed.playground).toBeUndefined();
		});

		it('should include mode if not default', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { mode: 'seamless' });
			const decompressed = uncompressState(result);
			expect(decompressed.mode).toBe('seamless');
		});

		it('should not include default mode', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { mode: 'browser-full-screen' });
			const decompressed = uncompressState(result);
			expect(decompressed.mode).toBeUndefined();
		});

		it('should include previewMode option', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { previewMode: 'mobile' });
			const decompressed = uncompressState(result);
			expect(decompressed.previewMode).toBe('mobile');
		});

		it('should include excludeMeta flag when true', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { excludeMeta: true });
			const decompressed = uncompressState(result);
			expect(decompressed.excludeMeta).toBe(true);
		});

		it('should not include excludeMeta when false', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const result = compressState(steps, { excludeMeta: false });
			const decompressed = uncompressState(result);
			expect(decompressed.excludeMeta).toBeUndefined();
		});

		it('should compress multiple steps', () => {
			const steps: StepConfig[] = [
				{ step: 'login', username: 'admin' },
				{ step: 'installPlugin', slug: 'hello-dolly' },
				{ step: 'installTheme', slug: 'twentytwentythree' }
			];
			const result = compressState(steps, {});
			const decompressed = uncompressState(result);
			expect(decompressed.steps).toHaveLength(3);
			expect(decompressed.steps[0].step).toBe('login');
			expect(decompressed.steps[1].step).toBe('installPlugin');
			expect(decompressed.steps[2].step).toBe('installTheme');
		});

		it('should preserve step properties', () => {
			const steps: StepConfig[] = [
				{
					step: 'installPlugin',
					slug: 'hello-dolly',
					activate: true,
					version: '1.0.0'
				}
			];
			const result = compressState(steps, {});
			const decompressed = uncompressState(result);
			expect(decompressed.steps[0].slug).toBe('hello-dolly');
			expect(decompressed.steps[0].activate).toBe(true);
			expect(decompressed.steps[0].version).toBe('1.0.0');
		});

		it('should include count field', () => {
			const steps: StepConfig[] = [
				{ step: 'installPlugin', slug: 'test', count: 5 }
			];
			const result = compressState(steps, {});
			const decompressed = uncompressState(result);
			expect(decompressed.steps[0].count).toBe(5);
		});

		it('should handle complex nested data', () => {
			const steps: StepConfig[] = [
				{
					step: 'runPHP',
					code: '<?php echo "Hello World"; ?>',
					type: 'inline'
				}
			];
			const result = compressState(steps, { title: 'Test Blueprint' });
			const decompressed = uncompressState(result);
			expect(decompressed.steps[0].code).toBe('<?php echo "Hello World"; ?>');
			expect(decompressed.title).toBe('Test Blueprint');
		});

		it('should handle all options together', () => {
			const steps: StepConfig[] = [
				{ step: 'login' }
			];
			const options = {
				title: 'Full Test',
				autosave: '10',
				playground: 'custom.test',
				mode: 'seamless',
				previewMode: 'tablet',
				excludeMeta: true
			};
			const result = compressState(steps, options);
			const decompressed = uncompressState(result);
			expect(decompressed.title).toBe('Full Test');
			expect(decompressed.autosave).toBe('10');
			expect(decompressed.playground).toBe('custom.test');
			expect(decompressed.mode).toBe('seamless');
			expect(decompressed.previewMode).toBe('tablet');
			expect(decompressed.excludeMeta).toBe(true);
		});
	});

	describe('uncompressState', () => {
		it('should return empty steps for invalid base64', () => {
			const result = uncompressState('invalid-base64-$$$');
			expect(result).toEqual({ steps: [] });
		});

		it('should return empty steps for empty string', () => {
			const result = uncompressState('');
			expect(result).toEqual({ steps: [] });
		});

		it('should handle corrupted JSON', () => {
			// Create a base64 string that decodes to invalid JSON
			const invalidJson = btoa('{ invalid json }');
			const result = uncompressState(invalidJson);
			expect(result).toEqual({ steps: [] });
		});

		it('should decompress valid state', () => {
			const steps: StepConfig[] = [
				{ step: 'login', username: 'admin' }
			];
			const compressed = compressState(steps, { title: 'Test' });
			const result = uncompressState(compressed);
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0].step).toBe('login');
			expect(result.title).toBe('Test');
		});
	});

	describe('round-trip compression/decompression', () => {
		it('should preserve simple state', () => {
			const original: CompressedState = {
				steps: [
					{ step: 'login', username: 'admin' }
				]
			};
			const compressed = compressState(original.steps, {});
			const decompressed = uncompressState(compressed);
			expect(decompressed).toEqual(original);
		});

		it('should preserve complex state', () => {
			const original: CompressedState = {
				steps: [
					{ step: 'login', username: 'admin', password: 'password' },
					{ step: 'installPlugin', slug: 'test-plugin', count: 3 },
					{ step: 'runPHP', code: '<?php echo "test"; ?>' }
				],
				title: 'Complex Blueprint',
				autosave: '15'
			};
			const compressed = compressState(original.steps, {
				title: original.title,
				autosave: original.autosave
			});
			const decompressed = uncompressState(compressed);
			expect(decompressed).toEqual(original);
		});

		it('should preserve unicode characters', () => {
			const original: CompressedState = {
				steps: [
					{ step: 'runPHP', code: 'echo "Hello 世界";' }
				],
				title: 'Unicode Test 测试'
			};
			const compressed = compressState(original.steps, { title: original.title });
			const decompressed = uncompressState(compressed);
			expect(decompressed.steps[0].code).toBe('echo "Hello 世界";');
			expect(decompressed.title).toBe('Unicode Test 测试');
		});

		it('should preserve special characters', () => {
			const original: CompressedState = {
				steps: [
					{ step: 'runPHP', code: 'test & <html> "quotes" \'apostrophes\'' }
				]
			};
			const compressed = compressState(original.steps, {});
			const decompressed = uncompressState(compressed);
			expect(decompressed.steps[0].code).toBe('test & <html> "quotes" \'apostrophes\'');
		});

		it('should preserve empty arrays', () => {
			const original: CompressedState = {
				steps: []
			};
			const compressed = compressState(original.steps, {});
			expect(compressed).toBe('');
		});
	});

	describe('extractStepDataFromElement', () => {
		let stepElement: HTMLElement;

		beforeEach(() => {
			stepElement = document.createElement('div');
			stepElement.className = 'step';
		});

		afterEach(() => {
			stepElement.remove();
		});

		it('should extract step name from data-step attribute', () => {
			stepElement.dataset.step = 'login';
			const result = extractStepDataFromElement(stepElement);
			expect(result.step).toBe('login');
		});

		it('should return empty vars when no inputs', () => {
			stepElement.dataset.step = 'login';
			const result = extractStepDataFromElement(stepElement);
			expect(result.vars).toBeUndefined();
		});

		it('should extract text input values', () => {
			stepElement.dataset.step = 'login';
			const input = document.createElement('input');
			input.type = 'text';
			input.name = 'username';
			input.value = 'admin';
			stepElement.appendChild(input);

			const result = extractStepDataFromElement(stepElement);
			expect(result.username).toBe('admin');
		});

		it('should extract checkbox values', () => {
			stepElement.dataset.step = 'installPlugin';
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.name = 'activate';
			checkbox.checked = true;
			stepElement.appendChild(checkbox);

			const result = extractStepDataFromElement(stepElement);
			expect(result.activate).toBe(true);
		});

		it('should extract unchecked checkbox as false', () => {
			stepElement.dataset.step = 'installPlugin';
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.name = 'activate';
			checkbox.checked = false;
			stepElement.appendChild(checkbox);

			const result = extractStepDataFromElement(stepElement);
			expect(result.activate).toBe(false);
		});

		it('should extract textarea values', () => {
			stepElement.dataset.step = 'runPHP';
			const textarea = document.createElement('textarea');
			textarea.name = 'code';
			textarea.value = '<?php echo "test"; ?>';
			stepElement.appendChild(textarea);

			const result = extractStepDataFromElement(stepElement);
			expect(result.code).toBe('<?php echo "test"; ?>');
		});

		it('should extract select values', () => {
			stepElement.dataset.step = 'setLanguage';
			const select = document.createElement('select');
			select.name = 'language';
			const option = document.createElement('option');
			option.value = 'en_US';
			option.selected = true;
			select.appendChild(option);
			stepElement.appendChild(select);

			const result = extractStepDataFromElement(stepElement);
			expect(result.language).toBe('en_US');
		});

		it('should extract count field separately', () => {
			stepElement.dataset.step = 'installPlugin';
			const countInput = document.createElement('input');
			countInput.type = 'text';
			countInput.name = 'count';
			countInput.value = '5';
			stepElement.appendChild(countInput);

			const result = extractStepDataFromElement(stepElement);
			expect(result.count).toBe(5);
			expect(result.vars).toBeUndefined();
		});

		it('should handle multiple inputs with same name as array', () => {
			stepElement.dataset.step = 'test';
			const input1 = document.createElement('input');
			input1.type = 'text';
			input1.name = 'plugin';
			input1.value = 'plugin1';
			stepElement.appendChild(input1);

			const input2 = document.createElement('input');
			input2.type = 'text';
			input2.name = 'plugin';
			input2.value = 'plugin2';
			stepElement.appendChild(input2);

			const result = extractStepDataFromElement(stepElement);
			expect(Array.isArray(result.plugin)).toBe(true);
			expect(result.plugin).toEqual(['plugin1', 'plugin2']);
		});

		it('should handle multiple checkboxes with same name', () => {
			stepElement.dataset.step = 'test';
			const cb1 = document.createElement('input');
			cb1.type = 'checkbox';
			cb1.name = 'options';
			cb1.checked = true;
			stepElement.appendChild(cb1);

			const cb2 = document.createElement('input');
			cb2.type = 'checkbox';
			cb2.name = 'options';
			cb2.checked = false;
			stepElement.appendChild(cb2);

			const result = extractStepDataFromElement(stepElement);
			expect(Array.isArray(result.options)).toBe(true);
			expect(result.options).toEqual([true, false]);
		});

		it('should extract multiple different inputs', () => {
			stepElement.dataset.step = 'installPlugin';

			const slug = document.createElement('input');
			slug.type = 'text';
			slug.name = 'slug';
			slug.value = 'hello-dolly';
			stepElement.appendChild(slug);

			const activate = document.createElement('input');
			activate.type = 'checkbox';
			activate.name = 'activate';
			activate.checked = true;
			stepElement.appendChild(activate);

			const version = document.createElement('input');
			version.type = 'text';
			version.name = 'version';
			version.value = '1.0.0';
			stepElement.appendChild(version);

			const result = extractStepDataFromElement(stepElement);
			expect(result.slug).toBe('hello-dolly');
			expect(result.activate).toBe(true);
			expect(result.version).toBe('1.0.0');
		});

		it('should handle empty input values', () => {
			stepElement.dataset.step = 'test';
			const input = document.createElement('input');
			input.type = 'text';
			input.name = 'value';
			input.value = '';
			stepElement.appendChild(input);

			const result = extractStepDataFromElement(stepElement);
			expect(result.value).toBe('');
		});

		it('should combine count with other vars', () => {
			stepElement.dataset.step = 'test';

			const count = document.createElement('input');
			count.name = 'count';
			count.value = '3';
			stepElement.appendChild(count);

			const slug = document.createElement('input');
			slug.name = 'slug';
			slug.value = 'test-plugin';
			stepElement.appendChild(slug);

			const result = extractStepDataFromElement(stepElement);
			expect(result.count).toBe(3);
			expect(result.slug).toBe('test-plugin');
		});
	});
});
