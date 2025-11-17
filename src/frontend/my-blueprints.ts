/**
 * My Blueprints - Blueprint history/saved blueprints management
 * Handles persistence and retrieval of saved blueprints in localStorage
 */

const HISTORY_STORAGE_KEY = 'playground-blueprint-history';
const MAX_HISTORY_ENTRIES = 50;

export interface BlueprintHistoryEntry {
	id: number;
	date: string;
	title: string;
	compiledBlueprint: any;
	stepConfig: any;
}

export function getHistory(): BlueprintHistoryEntry[] {
	try {
		const history = localStorage.getItem(HISTORY_STORAGE_KEY);
		return history ? JSON.parse(history) : [];
	} catch (e) {
		console.error('Failed to load history:', e);
		return [];
	}
}

export function saveHistory(history: BlueprintHistoryEntry[]): void {
	try {
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
	} catch (e) {
		console.error('Failed to save history:', e);
	}
}

export function addBlueprintToHistory(
	compiledBlueprint: any,
	stepConfig: any,
	title: string
): boolean {
	const history = getHistory();
	const entry: BlueprintHistoryEntry = {
		id: Date.now(),
		date: new Date().toISOString(),
		title: title,
		compiledBlueprint: compiledBlueprint,
		stepConfig: stepConfig
	};

	history.unshift(entry);
	if (history.length > MAX_HISTORY_ENTRIES) {
		history.splice(MAX_HISTORY_ENTRIES);
	}

	saveHistory(history);
	return true;
}

export function addBlueprintToHistoryWithId(
	compiledBlueprint: any,
	stepConfig: any,
	title: string
): number | null {
	const history = getHistory();

	// Check if the most recent entry is identical (avoid duplicate saves)
	if (history.length > 0) {
		const lastEntry = history[0];
		const lastBlueprintString = JSON.stringify(lastEntry.compiledBlueprint);
		const currentBlueprintString = JSON.stringify(compiledBlueprint);
		if (lastBlueprintString === currentBlueprintString) {
			return null;
		}
	}

	const entryId = Date.now();
	const entry: BlueprintHistoryEntry = {
		id: entryId,
		date: new Date().toISOString(),
		title: title,
		compiledBlueprint: compiledBlueprint,
		stepConfig: stepConfig
	};

	history.unshift(entry);
	if (history.length > MAX_HISTORY_ENTRIES) {
		history.splice(MAX_HISTORY_ENTRIES);
	}

	saveHistory(history);
	return entryId;
}

export function deleteBlueprintFromHistory(entryId: number): BlueprintHistoryEntry | null {
	const history = getHistory();
	const entryIndex = history.findIndex(entry => entry.id === entryId);

	if (entryIndex === -1) {
		return null;
	}

	const deletedEntry = history[entryIndex];
	history.splice(entryIndex, 1);
	saveHistory(history);

	return deletedEntry;
}

export function renameBlueprintInHistory(entryId: number, newTitle: string): boolean {
	const history = getHistory();
	const entry = history.find(e => e.id === entryId);

	if (!entry) {
		return false;
	}

	entry.title = newTitle;
	saveHistory(history);
	return true;
}

export function getBlueprintFromHistory(entryId: number): BlueprintHistoryEntry | null {
	const history = getHistory();
	return history.find(entry => entry.id === entryId) || null;
}

export function isBlueprintInHistory(compiledBlueprint: any): boolean {
	const history = getHistory();
	if (history.length === 0) {
		return false;
	}

	const lastEntry = history[0];
	const lastBlueprintString = JSON.stringify(lastEntry.compiledBlueprint);
	const currentBlueprintString = JSON.stringify(compiledBlueprint);
	return lastBlueprintString === currentBlueprintString;
}

export function clearHistory(): void {
	localStorage.removeItem(HISTORY_STORAGE_KEY);
}
