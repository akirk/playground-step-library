import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateLabel, generateFilename } from './label-generator';

describe('label-generator', () => {
	describe('generateFilename', () => {
		it('should convert title to lowercase filename', () => {
			expect(generateFilename('My Blueprint')).toBe('my-blueprint.json');
		});

		it('should replace spaces with hyphens', () => {
			expect(generateFilename('Test Title Here')).toBe('test-title-here.json');
		});

		it('should replace special characters with hyphens', () => {
			expect(generateFilename('Test@Title#Here!')).toBe('test-title-here-.json');
		});

		it('should handle multiple consecutive special characters', () => {
			expect(generateFilename('Test   Title')).toBe('test---title.json');
		});

		it('should preserve hyphens', () => {
			expect(generateFilename('test-title')).toBe('test-title.json');
		});

		it('should preserve numbers', () => {
			expect(generateFilename('Test 123 Title')).toBe('test-123-title.json');
		});

		it('should add .json extension', () => {
			expect(generateFilename('test')).toBe('test.json');
		});

		it('should handle empty strings', () => {
			expect(generateFilename('')).toBe('.json');
		});
	});

	describe('generateLabel', () => {
		let blueprintSteps: HTMLElement;

		beforeEach(() => {
			// Create the blueprint-steps container
			blueprintSteps = document.createElement('div');
			blueprintSteps.id = 'blueprint-steps';
			document.body.appendChild(blueprintSteps);
		});

		afterEach(() => {
			// Clean up
			blueprintSteps.remove();
		});

		it('should return "Empty Blueprint" when no steps', () => {
			expect(generateLabel()).toBe('Empty Blueprint');
		});

		it('should return "Empty Blueprint" when steps container is empty', () => {
			expect(generateLabel()).toBe('Empty Blueprint');
		});

		it('should generate label for single plugin', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installPlugin';

			const pluginInput = document.createElement('input');
			pluginInput.name = 'pluginData';
			pluginInput.value = 'hello-dolly';
			step.appendChild(pluginInput);

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('Plugin (hello dolly)');
		});

		it('should generate label for multiple plugins', () => {
			const step1 = document.createElement('div');
			step1.className = 'step';
			step1.dataset.step = 'installPlugin';
			const plugin1 = document.createElement('input');
			plugin1.name = 'pluginData';
			plugin1.value = 'hello-dolly';
			step1.appendChild(plugin1);

			const step2 = document.createElement('div');
			step2.className = 'step';
			step2.dataset.step = 'installPlugin';
			const plugin2 = document.createElement('input');
			plugin2.name = 'pluginData';
			plugin2.value = 'akismet';
			step2.appendChild(plugin2);

			blueprintSteps.appendChild(step1);
			blueprintSteps.appendChild(step2);

			expect(generateLabel()).toBe('Plugins (hello dolly, akismet)');
		});

		it('should handle plugin URL with .zip extension', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installPlugin';

			const pluginInput = document.createElement('input');
			pluginInput.name = 'url';
			pluginInput.value = 'https://example.com/my-plugin.zip';
			step.appendChild(pluginInput);

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('Plugin (my plugin)');
		});

		it('should generate label for theme', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installTheme';

			const themeInput = document.createElement('input');
			themeInput.name = 'themeData';
			themeInput.value = 'twentytwentythree';
			step.appendChild(themeInput);

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('Theme (twentytwentythree)');
		});

		it('should handle theme with slug input', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installTheme';

			const themeInput = document.createElement('input');
			themeInput.name = 'slug';
			themeInput.value = 'my-theme';
			step.appendChild(themeInput);

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('Theme (my theme)');
		});

		it('should generate label for other step types', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'setSiteName';

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('setSiteName');
		});

		it('should combine plugins and themes', () => {
			const pluginStep = document.createElement('div');
			pluginStep.className = 'step';
			pluginStep.dataset.step = 'installPlugin';
			const plugin = document.createElement('input');
			plugin.name = 'pluginData';
			plugin.value = 'hello-dolly';
			pluginStep.appendChild(plugin);

			const themeStep = document.createElement('div');
			themeStep.className = 'step';
			themeStep.dataset.step = 'installTheme';
			const theme = document.createElement('input');
			theme.name = 'themeData';
			theme.value = 'twentytwentythree';
			themeStep.appendChild(theme);

			blueprintSteps.appendChild(pluginStep);
			blueprintSteps.appendChild(themeStep);

			expect(generateLabel()).toBe('Plugin (hello dolly) + Theme (twentytwentythree)');
		});

		it('should combine plugins, themes, and other steps', () => {
			const pluginStep = document.createElement('div');
			pluginStep.className = 'step';
			pluginStep.dataset.step = 'installPlugin';
			const plugin = document.createElement('input');
			plugin.name = 'pluginData';
			plugin.value = 'hello-dolly';
			pluginStep.appendChild(plugin);

			const themeStep = document.createElement('div');
			themeStep.className = 'step';
			themeStep.dataset.step = 'installTheme';
			const theme = document.createElement('input');
			theme.name = 'themeData';
			theme.value = 'twentytwentythree';
			themeStep.appendChild(theme);

			const otherStep = document.createElement('div');
			otherStep.className = 'step';
			otherStep.dataset.step = 'setSiteName';

			blueprintSteps.appendChild(pluginStep);
			blueprintSteps.appendChild(themeStep);
			blueprintSteps.appendChild(otherStep);

			expect(generateLabel()).toBe('Plugin (hello dolly) + Theme (twentytwentythree) + setSiteName');
		});

		it('should summarize many other steps', () => {
			for (let i = 0; i < 5; i++) {
				const step = document.createElement('div');
				step.className = 'step';
				step.dataset.step = `step${i}`;
				blueprintSteps.appendChild(step);
			}

			expect(generateLabel()).toBe('5 more steps');
		});

		it('should show up to 2 other steps by name', () => {
			const step1 = document.createElement('div');
			step1.className = 'step';
			step1.dataset.step = 'setSiteName';

			const step2 = document.createElement('div');
			step2.className = 'step';
			step2.dataset.step = 'setLanguage';

			blueprintSteps.appendChild(step1);
			blueprintSteps.appendChild(step2);

			expect(generateLabel()).toBe('setSiteName, setLanguage');
		});

		it('should handle plugin without slug or URL', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installPlugin';
			// No input, so it should be treated as "other step"

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('installPlugin');
		});

		it('should handle theme without slug or URL', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installTheme';
			// No input, so it should be treated as "other step"

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('installTheme');
		});

		it('should extract plugin name from nested path', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installPlugin';

			const pluginInput = document.createElement('input');
			pluginInput.name = 'url';
			pluginInput.value = 'https://example.com/path/to/my-plugin.zip';
			step.appendChild(pluginInput);

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('Plugin (my plugin)');
		});

		it('should replace hyphens with spaces in plugin names', () => {
			const step = document.createElement('div');
			step.className = 'step';
			step.dataset.step = 'installPlugin';

			const pluginInput = document.createElement('input');
			pluginInput.name = 'pluginData';
			pluginInput.value = 'my-awesome-plugin';
			step.appendChild(pluginInput);

			blueprintSteps.appendChild(step);

			expect(generateLabel()).toBe('Plugin (my awesome plugin)');
		});

		it('should limit plugins display to first 2', () => {
			for (let i = 0; i < 5; i++) {
				const step = document.createElement('div');
				step.className = 'step';
				step.dataset.step = 'installPlugin';
				const plugin = document.createElement('input');
				plugin.name = 'pluginData';
				plugin.value = `plugin${i}`;
				step.appendChild(plugin);
				blueprintSteps.appendChild(step);
			}

			expect(generateLabel()).toBe('Plugins (plugin0, plugin1)');
		});

		it('should only show first theme', () => {
			const theme1 = document.createElement('div');
			theme1.className = 'step';
			theme1.dataset.step = 'installTheme';
			const input1 = document.createElement('input');
			input1.name = 'themeData';
			input1.value = 'theme1';
			theme1.appendChild(input1);

			const theme2 = document.createElement('div');
			theme2.className = 'step';
			theme2.dataset.step = 'installTheme';
			const input2 = document.createElement('input');
			input2.name = 'themeData';
			input2.value = 'theme2';
			theme2.appendChild(input2);

			blueprintSteps.appendChild(theme1);
			blueprintSteps.appendChild(theme2);

			expect(generateLabel()).toBe('Theme (theme1)');
		});
	});
});
