/**
 * History Controller
 * Manages My Blueprints modal, history operations, and blueprint import/export
 */

import {
	getHistory,
	saveHistory,
	addBlueprintToHistory,
	addBlueprintToHistoryWithId,
	deleteBlueprintFromHistory,
	renameBlueprintInHistory,
	getBlueprintFromHistory,
	type BlueprintHistoryEntry
} from './my-blueprints';
import { toastService } from './toast-service';
import { generateLabel } from './label-generator';
import { blueprintEventBus } from './blueprint-event-bus';
import { cleanupHistoryBlueprintAceEditor, initHistoryBlueprintAceEditor } from './ace-editor';

export interface HistoryControllerDependencies {
	getBlueprintValue: () => string;
	captureCurrentSteps: () => any;
	restoreSteps: (stepsData: any, title: string) => void;
	isBlueprintAlreadySaved: () => boolean;
	showSaveBlueprintDialog: (defaultName: string, isOverwrite: boolean) => void;
}

export class HistoryController {
	private deps: HistoryControllerDependencies;
	private currentHistorySelection: BlueprintHistoryEntry | null = null;

	constructor(deps: HistoryControllerDependencies) {
		this.deps = deps;
		this.setupEventListeners();
	}

	/**
	 * Setup event listeners for history UI
	 */
	private setupEventListeners(): void {
		// My Blueprints button
		const myBlueprintsBtn = document.getElementById('my-blueprints-btn');
		if (myBlueprintsBtn) {
			myBlueprintsBtn.addEventListener('click', () => {
				this.openHistoryModal();
			});
		}

		// Search input
		const searchInput = document.getElementById('history-search');
		if (searchInput) {
			searchInput.addEventListener('input', () => {
				this.renderHistoryList();
			});
		}

		// Close button
		const closeBtn = document.getElementById('history-close');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				this.closeHistoryModal();
			});
		}

		// Export all button
		const exportAllBtn = document.getElementById('export-all-blueprints');
		if (exportAllBtn) {
			exportAllBtn.addEventListener('click', () => {
				this.exportAllBlueprints();
			});
		}

		// Import file input
		const importInput = document.getElementById('import-blueprints-input') as HTMLInputElement;
		if (importInput) {
			importInput.addEventListener('change', (e) => {
				const target = e.target as HTMLInputElement;
				if (target.files && target.files[0]) {
					this.importBlueprintsFromFile(target.files[0]);
				}
			});
		}
	}

	/**
	 * Open the My Blueprints modal
	 */
	openHistoryModal(): void {
		const modal = document.getElementById('history-modal');
		if (modal) {
			modal.style.display = 'flex';
			this.renderHistoryList();
			this.updateHistoryButtonVisibility();
		}
	}

	/**
	 * Close the My Blueprints modal
	 */
	closeHistoryModal(): void {
		const modal = document.getElementById('history-modal');
		if (modal) {
			modal.style.display = 'none';
			cleanupHistoryBlueprintAceEditor();
		}
	}

	/**
	 * Add current blueprint to history
	 */
	addToHistory(customTitle?: string): void {
		const stepConfig = this.deps.captureCurrentSteps();
		const title = customTitle || stepConfig.title || generateLabel();
		delete stepConfig.title;

		const compiledBlueprint = this.deps.getBlueprintValue();
		const success = addBlueprintToHistory(compiledBlueprint, stepConfig, title);

		if (success) {
			toastService.show('Saved to My Blueprints');
			this.renderHistoryList();
			this.updateHistoryButtonVisibility();
		}
	}

	/**
	 * Add to history with specific ID (for updates)
	 */
	addToHistoryWithId(customTitle?: string): number | null {
		const stepConfig = this.deps.captureCurrentSteps();
		const title = customTitle || stepConfig.title || generateLabel();
		delete stepConfig.title;

		const compiledBlueprint = this.deps.getBlueprintValue();
		const entryId = addBlueprintToHistoryWithId(compiledBlueprint, stepConfig, title);

		if (entryId) {
			this.updateHistoryButtonVisibility();
		}

		return entryId;
	}

	/**
	 * Show save dialog
	 */
	saveToHistoryWithName(): void {
		const defaultName = generateLabel();
		this.deps.showSaveBlueprintDialog(defaultName, false);
	}

	/**
	 * Update visibility of history button based on whether blueprints exist
	 */
	updateHistoryButtonVisibility(): void {
		const history = getHistory();
		const myBlueprintsBtn = document.getElementById('my-blueprints-btn');

		if (myBlueprintsBtn) {
			if (history.length === 0) {
				myBlueprintsBtn.style.display = 'none';
			} else {
				myBlueprintsBtn.style.display = '';
			}
		}
	}

	/**
	 * Render the history list with search filtering
	 */
	renderHistoryList(): void {
		const history = getHistory();
		const searchInput = document.getElementById('history-search') as HTMLInputElement;
		const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

		const filteredHistory = searchTerm
			? history.filter(entry => entry.title.toLowerCase().includes(searchTerm))
			: history;

		const listContainer = document.getElementById('history-list');
		if (!listContainer) return;

		listContainer.textContent = '';

		if (filteredHistory.length === 0) {
			const emptyState = document.createElement('div');
			emptyState.className = 'empty-state';
			emptyState.textContent = searchTerm ? 'No blueprints match your search' : 'No saved blueprints yet';
			listContainer.appendChild(emptyState);
			return;
		}

		filteredHistory.forEach(entry => {
			const item = document.createElement('div');
			item.className = 'history-item';
			item.dataset.id = entry.id.toString();

			if (this.currentHistorySelection && this.currentHistorySelection.id === entry.id) {
				item.classList.add('selected');
			}

			const title = document.createElement('div');
			title.className = 'history-item-title';
			title.textContent = entry.title;

			const date = document.createElement('div');
			date.className = 'history-item-date';
			date.textContent = this.formatDate(entry.date);

			item.appendChild(title);
			item.appendChild(date);

			item.addEventListener('click', () => {
				this.selectHistoryEntry(entry.id);
			});

			listContainer.appendChild(item);
		});
	}

	/**
	 * Format date for display
	 */
	private formatDate(isoString: string): string {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) {
			return 'Just now';
		} else if (diffMins < 60) {
			return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
		} else if (diffHours < 24) {
			return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
		} else if (diffDays < 7) {
			return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
		} else {
			return date.toLocaleDateString();
		}
	}

	/**
	 * Select a history entry and show its details
	 */
	selectHistoryEntry(entryId: number): void {
		const history = getHistory();
		const entry = history.find(e => e.id === entryId);

		if (!entry) return;

		this.currentHistorySelection = entry;

		// Update UI selection
		document.querySelectorAll('.history-item').forEach(item => {
			if (parseInt(item.getAttribute('data-id') || '0') === entryId) {
				item.classList.add('selected');
			} else {
				item.classList.remove('selected');
			}
		});

		// Show detail panel
		const detailEmpty = document.getElementById('history-detail-empty');
		const detailContent = document.getElementById('history-detail-content');

		if (detailEmpty) detailEmpty.style.display = 'none';
		if (detailContent) detailContent.style.display = 'block';

		// Update detail content
		const detailTitle = document.getElementById('history-detail-title');
		if (detailTitle) {
			detailTitle.textContent = entry.title;
		}

		// Initialize Ace editor for preview
		const blueprintPreview = document.getElementById('history-blueprint-preview') as HTMLTextAreaElement;
		if (blueprintPreview) {
			initHistoryBlueprintAceEditor();
			blueprintPreview.value = entry.compiledBlueprint;
		}

		// Setup action buttons
		this.setupDetailActions(entryId);
	}

	/**
	 * Setup action buttons for selected entry
	 */
	private setupDetailActions(entryId: number): void {
		const loadBtn = document.getElementById('history-load-btn');
		const renameBtn = document.getElementById('history-rename-btn');
		const deleteBtn = document.getElementById('history-delete-btn');
		const playgroundBtn = document.getElementById('history-playground-btn');

		if (loadBtn) {
			loadBtn.onclick = () => {
				this.loadHistoryEntry(entryId);
			};
		}

		if (renameBtn) {
			renameBtn.onclick = () => {
				this.renameHistoryEntry(entryId);
			};
		}

		if (deleteBtn) {
			deleteBtn.onclick = () => {
				this.deleteHistoryEntry(entryId);
			};
		}

		if (playgroundBtn) {
			playgroundBtn.onclick = () => {
				window.open(this.getHistoryPlaygroundUrl(), '_blank');
			};
		}
	}

	/**
	 * Load a history entry into the main interface
	 */
	private loadHistoryEntry(entryId: number): void {
		const entry = getBlueprintFromHistory(entryId);
		if (entry) {
			this.deps.restoreSteps(entry.stepConfig, entry.title);
			this.closeHistoryModal();
		}
	}

	/**
	 * Rename a history entry
	 */
	private renameHistoryEntry(entryId: number): void {
		const entry = getBlueprintFromHistory(entryId);
		if (!entry) return;

		const newName = prompt('Enter new name:', entry.title);
		if (newName && newName.trim() && newName !== entry.title) {
			renameBlueprintInHistory(entryId, newName.trim());
			this.renderHistoryList();

			// Update detail title if this entry is selected
			if (this.currentHistorySelection && this.currentHistorySelection.id === entryId) {
				this.currentHistorySelection.title = newName.trim();
				const detailTitle = document.getElementById('history-detail-title');
				if (detailTitle) {
					detailTitle.textContent = newName.trim();
				}
			}
		}
	}

	/**
	 * Delete a history entry with undo capability
	 */
	deleteHistoryEntry(entryId: number): void {
		const history = getHistory();
		const entry = history.find(e => e.id === entryId);

		if (!entry) return;

		toastService.setLastDeletedEntry(entry);

		const filtered = history.filter(e => e.id !== entryId);
		saveHistory(filtered);
		this.updateHistoryButtonVisibility();

		if (this.currentHistorySelection && this.currentHistorySelection.id === entryId) {
			this.currentHistorySelection = null;
			const detailEmpty = document.getElementById('history-detail-empty');
			const detailContent = document.getElementById('history-detail-content');
			if (detailEmpty) detailEmpty.style.display = 'block';
			if (detailContent) detailContent.style.display = 'none';
		}

		this.renderHistoryList();

		toastService.showWithUndo(`Deleted "${entry.title}"`, () => {
			this.undoDelete();
		});
	}

	/**
	 * Undo delete operation
	 */
	private undoDelete(): void {
		const lastDeletedEntry = toastService.getLastDeletedEntry();
		if (!lastDeletedEntry) return;

		const history = getHistory();
		history.push(lastDeletedEntry);
		history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		saveHistory(history);
		this.updateHistoryButtonVisibility();

		toastService.setLastDeletedEntry(null);
		this.renderHistoryList();
		toastService.showWithUndo('Restored');
	}

	/**
	 * Get playground URL for selected entry
	 */
	private getHistoryPlaygroundUrl(): string {
		if (!this.currentHistorySelection) {
			return '';
		}

		const playground = 'playground.wordpress.net';
		const blueprint = encodeURIComponent(this.currentHistorySelection.compiledBlueprint);
		return `https://${playground}/#${blueprint}`;
	}

	/**
	 * Export all blueprints to JSON file
	 */
	exportAllBlueprints(): void {
		const history = getHistory();
		if (history.length === 0) {
			toastService.showWithUndo('No blueprints to export');
			return;
		}

		const exportData = {
			version: 1,
			exported: new Date().toISOString(),
			blueprints: history
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `my-blueprints-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toastService.show(`Exported ${history.length} blueprint${history.length !== 1 ? 's' : ''}`);
	}

	/**
	 * Import blueprints from JSON file
	 */
	importBlueprintsFromFile(file: File): void {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const importData = JSON.parse(content);

				let blueprintsToImport: BlueprintHistoryEntry[] = [];

				// Handle different import formats
				if (Array.isArray(importData)) {
					blueprintsToImport = importData;
				} else if (importData.blueprints && Array.isArray(importData.blueprints)) {
					blueprintsToImport = importData.blueprints;
				} else if (importData.stepConfig && importData.compiledBlueprint) {
					// Single blueprint format
					blueprintsToImport = [{
						id: Date.now(),
						title: importData.title || 'Imported Blueprint',
						date: new Date().toISOString(),
						stepConfig: importData.stepConfig,
						compiledBlueprint: importData.compiledBlueprint
					}];
				} else {
					throw new Error('Invalid import format');
				}

				// Validate and import
				const validBlueprints = blueprintsToImport.filter(bp =>
					bp.compiledBlueprint && bp.stepConfig
				);

				if (validBlueprints.length === 0) {
					toastService.showWithUndo('No valid blueprints found in file');
					return;
				}

				const history = getHistory();
				validBlueprints.forEach(bp => {
					if (!history.find(existing => existing.id === bp.id)) {
						history.push(bp);
					}
				});

				history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
				saveHistory(history);

				this.renderHistoryList();
				this.updateHistoryButtonVisibility();

				toastService.show(`Imported ${validBlueprints.length} blueprint${validBlueprints.length !== 1 ? 's' : ''}`);
			} catch (error) {
				console.error('Import failed:', error);
				toastService.showWithUndo('Failed to import blueprints. Invalid file format.');
			}

			// Reset file input
			const importInput = document.getElementById('import-blueprints-input') as HTMLInputElement;
			if (importInput) {
				importInput.value = '';
			}
		};

		reader.readAsText(file);
	}

	/**
	 * Check if blueprint is already saved
	 */
	isBlueprintAlreadySaved(): boolean {
		return this.deps.isBlueprintAlreadySaved();
	}
}
