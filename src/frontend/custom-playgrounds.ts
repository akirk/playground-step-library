/**
 * Custom Playgrounds
 * Manage user-created custom playground URLs stored in localStorage
 */

const CUSTOM_PLAYGROUNDS_STORAGE_KEY = 'customPlaygrounds';

export interface CustomPlayground {
	url: string;
	name: string;
}

/**
 * Get all custom playgrounds from localStorage
 */
export function getCustomPlaygrounds(): CustomPlayground[] {
	try {
		return JSON.parse(localStorage.getItem(CUSTOM_PLAYGROUNDS_STORAGE_KEY) || '[]');
	} catch (e) {
		console.error('Failed to load custom playgrounds:', e);
		return [];
	}
}

/**
 * Add a custom playground to localStorage
 */
export function addCustomPlayground(url: string, name?: string): void {
	const playgrounds = getCustomPlaygrounds();
	const displayName = name || url;

	// Check if already exists
	if (playgrounds.some(p => p.url === url)) {
		return;
	}

	playgrounds.push({ url, name: displayName });
	localStorage.setItem(CUSTOM_PLAYGROUNDS_STORAGE_KEY, JSON.stringify(playgrounds));
}

/**
 * Remove a custom playground from localStorage
 */
export function removeCustomPlayground(url: string): void {
	const playgrounds = getCustomPlaygrounds();
	const filtered = playgrounds.filter(p => p.url !== url);
	localStorage.setItem(CUSTOM_PLAYGROUNDS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Check if a custom playground URL exists
 */
export function customPlaygroundExists(url: string): boolean {
	const playgrounds = getCustomPlaygrounds();
	return playgrounds.some(p => p.url === url);
}

/**
 * Populate a select element with custom playgrounds
 */
export function populatePlaygroundSelect(selectEl: HTMLSelectElement): void {
	const playgrounds = getCustomPlaygrounds();

	// Remove existing custom options (keep the default ones)
	const customOptions = selectEl.querySelectorAll('option[data-custom="true"]');
	customOptions.forEach(opt => opt.remove());

	// Find the "Manage custom playgrounds..." option to insert before it
	const addOption = selectEl.querySelector('option[value="__manage_custom__"]');

	// Add custom playgrounds before the "Add custom..." option
	playgrounds.forEach(playground => {
		const option = document.createElement('option');
		option.value = playground.url;
		option.textContent = playground.name;
		option.dataset.custom = 'true';
		if (addOption) {
			selectEl.insertBefore(option, addOption);
		} else {
			selectEl.appendChild(option);
		}
	});
}
