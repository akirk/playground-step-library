/**
 * Blueprint Label Generator
 * Generates smart labels for blueprints based on their content
 */

/**
 * Generate a descriptive label from step blocks in the blueprint
 */
export function generateLabel(): string {
	const stepBlocks = document.querySelectorAll('#blueprint-steps .step');
	const stepCount = stepBlocks.length;
	const stepTypes = new Set<string>();
	const plugins: string[] = [];
	const themes: string[] = [];
	const otherSteps = new Set<string>();

	stepBlocks.forEach(function (block) {
		const stepType = (block as HTMLElement).dataset.step || (block.querySelector('[name="step"]') as HTMLInputElement)?.value;
		if (stepType) {
			stepTypes.add(stepType);

			if (stepType === 'installPlugin') {
				const pluginSlug = (block.querySelector('[name="pluginData"]') as HTMLInputElement)?.value ||
					(block.querySelector('[name="slug"]') as HTMLInputElement)?.value ||
					(block.querySelector('[name="url"]') as HTMLInputElement)?.value;
				if (pluginSlug && pluginSlug.trim()) {
					const parts = pluginSlug.split('/').filter(p => p.trim());
					const name = parts[parts.length - 1].replace(/\.zip$/, '').replace(/-/g, ' ');
					plugins.push(name);
				} else {
					otherSteps.add(stepType);
				}
			} else if (stepType === 'installTheme') {
				const themeSlug = (block.querySelector('[name="themeData"]') as HTMLInputElement)?.value ||
					(block.querySelector('[name="slug"]') as HTMLInputElement)?.value ||
					(block.querySelector('[name="url"]') as HTMLInputElement)?.value;
				if (themeSlug && themeSlug.trim()) {
					const parts = themeSlug.split('/').filter(p => p.trim());
					const name = parts[parts.length - 1].replace(/\.zip$/, '').replace(/-/g, ' ');
					themes.push(name);
				} else {
					otherSteps.add(stepType);
				}
			} else {
				otherSteps.add(stepType);
			}
		}
	});

	if (stepTypes.size === 0 || stepCount === 0) {
		return 'Empty Blueprint';
	}

	const parts: string[] = [];

	if (plugins.length > 0) {
		const pluginLabel = plugins.length === 1 ? 'Plugin' : 'Plugins';
		const pluginNames = plugins.slice(0, 2).join(', ');
		parts.push(pluginLabel + ' (' + pluginNames + ')');
	}

	if (themes.length > 0) {
		const themeName = themes[0];
		parts.push('Theme (' + themeName + ')');
	}

	if (otherSteps.size > 0) {
		const otherArray = Array.from(otherSteps);
		if (otherArray.length <= 2) {
			parts.push(otherArray.join(', '));
		} else {
			parts.push(otherArray.length + ' more step' + (otherArray.length !== 1 ? 's' : ''));
		}
	}

	if (parts.length > 0) {
		return parts.join(' + ');
	}

	return 'Empty Blueprint';
}

/**
 * Generate a filename from a title (sanitize for filesystem)
 */
export function generateFilename(title: string): string {
	return title.replace(/[^a-z0-9-]/gi, '-').toLowerCase() + '.json';
}
