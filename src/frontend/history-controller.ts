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
import { getMySteps, importMySteps } from './custom-steps';
import { toastService } from './toast-service';
import { generateLabel } from './label-generator';
import { blueprintEventBus } from './blueprint-event-bus';
import { cleanupHistoryBlueprintAceEditor, initHistoryBlueprintAceEditor, historyBlueprintAceEditor } from './ace-editor';
import { initMoreOptionsDropdown } from './url-controller';

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
		this.updateHistoryButtonVisibility();
	}

	/**
	 * Setup event listeners for history UI
	 */
	private setupEventListeners(): void {
		// My Blueprints button (Mine button)
		const myBlueprintsBtn = document.getElementById('history-button');
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

		// Save current button
		const saveCurrentBtn = document.getElementById('history-save-current-btn');
		if (saveCurrentBtn) {
			saveCurrentBtn.addEventListener('click', () => {
				this.deps.showSaveBlueprintDialog(generateLabel(), false);
			});
		}

		// Export all button
		const exportAllBtn = document.getElementById('history-export-all-btn');
		if (exportAllBtn) {
			exportAllBtn.addEventListener('click', () => {
				this.exportAllBlueprints();
			});
		}

		// Import button
		const importBtn = document.getElementById('history-import-btn');
		if (importBtn) {
			importBtn.addEventListener('click', () => {
				const fileInput = document.getElementById('history-import-file') as HTMLInputElement;
				if (fileInput) {
					fileInput.click();
				}
			});
		}

		// Import file input
		const importInput = document.getElementById('history-import-file') as HTMLInputElement;
		if (importInput) {
			importInput.addEventListener('change', (e) => {
				const target = e.target as HTMLInputElement;
				if (target.files && target.files[0]) {
					this.importBlueprintsFromFile(target.files[0]);
				}
			});
		}

		// Initialize more options dropdown
		const historyDropdown = document.getElementById('history-more-options-dropdown');
		if (historyDropdown) {
			initMoreOptionsDropdown(historyDropdown);
		}
	}

	/**
	 * Open the My Blueprints modal
	 */
	openHistoryModal(): void {
		const modal = document.getElementById('history-modal') as HTMLDialogElement;
		if (modal) {
			modal.showModal();
			this.renderHistoryList();
			this.updateHistoryButtonVisibility();
		}
	}

	/**
	 * Close the My Blueprints modal
	 */
	closeHistoryModal(): void {
		const modal = document.getElementById('history-modal') as HTMLDialogElement;
		if (modal) {
			modal.close();
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
			toastService.showGlobal('Saved to My Blueprints');
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
		const myBlueprintsBtn = document.getElementById('history-button');

		if (myBlueprintsBtn) {
			if (history.length === 0) {
				myBlueprintsBtn.style.display = 'none';
			} else {
				myBlueprintsBtn.style.display = 'flex';
			}
		}
	}

	/**
	 * Render the history list with search filtering, mixing blueprints and personal steps chronologically
	 */
	renderHistoryList(): void {
		const history = getHistory();
		const personalSteps = getMySteps();
		const searchInput = document.getElementById('history-search') as HTMLInputElement;
		const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

		const filteredHistory = searchTerm
			? history.filter(entry => entry.title.toLowerCase().includes(searchTerm))
			: history;

		const filteredPersonalSteps = searchTerm
			? Object.entries(personalSteps).filter(([name]) => name.toLowerCase().includes(searchTerm))
			: Object.entries(personalSteps);

		const listContainer = document.getElementById('history-list');
		if (!listContainer) return;

		listContainer.textContent = '';

		if (filteredHistory.length === 0 && filteredPersonalSteps.length === 0) {
			const emptyState = document.createElement('div');
			emptyState.className = 'empty-state';
			emptyState.textContent = searchTerm ? 'No items match your search' : 'No saved blueprints or personal steps yet';
			listContainer.appendChild(emptyState);
			return;
		}

		// Create combined list with type markers
		const combinedItems: Array<{ type: 'blueprint' | 'step', date: string, data: any }> = [];

		filteredHistory.forEach(entry => {
			combinedItems.push({
				type: 'blueprint',
				date: entry.date,
				data: entry
			});
		});

		filteredPersonalSteps.forEach(([name, stepDef]) => {
			combinedItems.push({
				type: 'step',
				date: stepDef.date || new Date(0).toISOString(),
				data: { name, stepDef }
			});
		});

		// Sort by date, newest first
		combinedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		// Render combined list
		combinedItems.forEach(({ type, data }) => {
			if (type === 'blueprint') {
				const entry = data;
				const item = document.createElement('div');
				item.className = 'history-entry';
				item.dataset.id = entry.id.toString();

				if (this.currentHistorySelection && this.currentHistorySelection.id === entry.id) {
					item.classList.add('selected');
				}

				const content = document.createElement('div');
				content.className = 'history-entry-content';

				const time = document.createElement('div');
				time.className = 'history-entry-time';
				time.textContent = this.formatDate(entry.date);

				const label = document.createElement('div');
				label.className = 'history-entry-label';
				label.textContent = entry.title;

				content.appendChild(time);
				content.appendChild(label);
				item.appendChild(content);

				content.addEventListener('click', () => {
					this.selectHistoryEntry(entry.id);
				});

				listContainer.appendChild(item);
			} else {
				const { name, stepDef } = data;
				const item = document.createElement('div');
				item.className = 'history-entry personal-step-entry';
				item.dataset.stepName = name;

				const content = document.createElement('div');
				content.className = 'history-entry-content';

				const time = document.createElement('div');
				time.className = 'history-entry-time';
				time.textContent = stepDef.date ? this.formatDate(stepDef.date) : 'Personal Step';

				const label = document.createElement('div');
				label.className = 'history-entry-label';
				label.textContent = name;

				content.appendChild(time);
				content.appendChild(label);
				item.appendChild(content);

				content.addEventListener('click', () => {
					this.showPersonalStepDetail(name, stepDef);
				});

				listContainer.appendChild(item);
			}
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
		document.querySelectorAll('.history-entry').forEach(item => {
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
		if (!detailContent) return;

		detailContent.style.display = 'flex';

		// Ensure blueprint view structure exists (may have been replaced by personal step view)
		let blueprintView = document.getElementById('history-blueprint-view') as HTMLTextAreaElement;
		if (!blueprintView) {
			this.restoreBlueprintDetailStructure(detailContent);
			blueprintView = document.getElementById('history-blueprint-view') as HTMLTextAreaElement;
		}

		// Update blueprint content
		if (blueprintView) {
			blueprintView.value = entry.compiledBlueprint;

			// If Ace editor exists, just update its value; otherwise initialize it
			if (historyBlueprintAceEditor) {
				historyBlueprintAceEditor.setValue(entry.compiledBlueprint, -1);
			} else {
				initHistoryBlueprintAceEditor();
			}
		}

		// Setup action buttons
		this.setupDetailActions(entryId);
	}

	/**
	 * Restore the blueprint detail view structure
	 */
	private restoreBlueprintDetailStructure(detailContent: HTMLElement): void {
		detailContent.textContent = '';

		const wrapper = document.createElement('div');
		wrapper.id = 'history-blueprint-wrapper';

		const textarea = document.createElement('textarea');
		textarea.id = 'history-blueprint-view';
		textarea.readOnly = true;
		wrapper.appendChild(textarea);

		const status = document.createElement('div');
		status.id = 'history-blueprint-status';
		status.className = 'ace-status-bar';
		wrapper.appendChild(status);

		detailContent.appendChild(wrapper);

		const actions = document.createElement('div');
		actions.id = 'history-actions';

		const restoreBtn = document.createElement('button');
		restoreBtn.id = 'history-restore-btn';
		restoreBtn.textContent = 'Restore';
		actions.appendChild(restoreBtn);

		const launchBtn = document.createElement('button');
		launchBtn.id = 'history-launch-btn';
		launchBtn.textContent = 'Launch in Playground';
		actions.appendChild(launchBtn);

		const moreOptionsDropdown = document.createElement('div');
		moreOptionsDropdown.id = 'history-more-options-dropdown';
		moreOptionsDropdown.className = 'more-options-dropdown';

		const moreOptionsButton = document.createElement('button');
		moreOptionsButton.className = 'more-options-button';
		moreOptionsButton.title = 'More options';
		moreOptionsButton.innerHTML = '<svg width="6" height="16" viewBox="0 0 4 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="5" r="2" fill="currentColor"/><circle cx="2" cy="12" r="2" fill="currentColor"/><circle cx="2" cy="19" r="2" fill="currentColor"/></svg>';
		moreOptionsDropdown.appendChild(moreOptionsButton);

		const moreOptionsMenu = document.createElement('div');
		moreOptionsMenu.className = 'more-options-menu';
		moreOptionsDropdown.appendChild(moreOptionsMenu);

		actions.appendChild(moreOptionsDropdown);
		detailContent.appendChild(actions);
	}

	/**
	 * Setup action buttons for selected entry
	 */
	private setupDetailActions(entryId: number): void {
		const restoreBtn = document.getElementById('history-restore-btn');
		const launchBtn = document.getElementById('history-launch-btn');
		const mobileDeleteBtn = document.getElementById('history-mobile-delete-btn');

		if (restoreBtn) {
			restoreBtn.onclick = () => {
				this.loadHistoryEntry(entryId);
			};
		}

		if (launchBtn) {
			launchBtn.onclick = () => {
				window.open(this.getHistoryPlaygroundUrl(), '_blank');
			};
		}

		if (mobileDeleteBtn) {
			mobileDeleteBtn.onclick = () => {
				this.deleteHistoryEntry(entryId);
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

		toastService.showInBlueprintsDialog(`Deleted "${entry.title}"`, () => {
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
		toastService.showInBlueprintsDialog('Restored');
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
	 * Export all blueprints and personal steps to JSON file
	 */
	exportAllBlueprints(): void {
		const history = getHistory();
		const personalSteps = getMySteps();
		const personalStepsCount = Object.keys(personalSteps).length;

		if (history.length === 0 && personalStepsCount === 0) {
			toastService.showInBlueprintsDialog('No blueprints or personal steps to export');
			return;
		}

		const exportData = {
			version: 1,
			exported: new Date().toISOString(),
			blueprints: history,
			personalSteps: personalSteps
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

		const parts = [];
		if (history.length > 0) {
			parts.push(`${history.length} blueprint${history.length !== 1 ? 's' : ''}`);
		}
		if (personalStepsCount > 0) {
			parts.push(`${personalStepsCount} personal step${personalStepsCount !== 1 ? 's' : ''}`);
		}
		toastService.showGlobal(`Exported ${parts.join(' and ')}`);
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
				let personalStepsToImport: Record<string, any> = {};

				// Handle different import formats
				if (Array.isArray(importData)) {
					blueprintsToImport = importData;
				} else if (importData.blueprints && Array.isArray(importData.blueprints)) {
					blueprintsToImport = importData.blueprints;
					// Also check for personal steps in the new format
					if (importData.personalSteps && typeof importData.personalSteps === 'object') {
						personalStepsToImport = importData.personalSteps;
					}
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

				// Validate and import blueprints
				const validBlueprints = blueprintsToImport.filter(bp =>
					bp.compiledBlueprint && bp.stepConfig
				);

				let importedBlueprintsCount = 0;
				let importedStepsCount = 0;

				if (validBlueprints.length > 0) {
					const history = getHistory();
					validBlueprints.forEach(bp => {
						if (!history.find(existing => existing.id === bp.id)) {
							history.push(bp);
							importedBlueprintsCount++;
						}
					});

					history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
					saveHistory(history);
				}

				// Import personal steps
				if (Object.keys(personalStepsToImport).length > 0) {
					importedStepsCount = importMySteps(personalStepsToImport, true);
				}

				if (importedBlueprintsCount === 0 && importedStepsCount === 0) {
					toastService.showInBlueprintsDialog('No new items to import (duplicates ignored)');
					return;
				}

				this.renderHistoryList();
				this.updateHistoryButtonVisibility();

				const parts = [];
				if (importedBlueprintsCount > 0) {
					parts.push(`${importedBlueprintsCount} blueprint${importedBlueprintsCount !== 1 ? 's' : ''}`);
				}
				if (importedStepsCount > 0) {
					parts.push(`${importedStepsCount} personal step${importedStepsCount !== 1 ? 's' : ''}`);
				}
				toastService.showGlobal(`Imported ${parts.join(' and ')}`);
			} catch (error) {
				console.error('Import failed:', error);
				toastService.showInBlueprintsDialog('Failed to import. Invalid file format.');
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

	/**
	 * Show personal step detail view
	 */
	showPersonalStepDetail(stepName: string, stepDefinition: any): void {
		const detailContent = document.getElementById('history-detail-content');
		const detailEmpty = document.getElementById('history-detail-empty');

		if (!detailContent || !detailEmpty) return;

		// Cleanup Ace editor before clearing DOM
		cleanupHistoryBlueprintAceEditor();

		// Clear current blueprint selection
		this.currentHistorySelection = null;
		document.querySelectorAll('.history-entry').forEach(item => {
			item.classList.remove('selected');
		});

		detailEmpty.style.display = 'none';
		detailContent.style.display = 'block';
		detailContent.textContent = '';

		const header = document.createElement('div');
		header.className = 'history-detail-header';

		const title = document.createElement('h3');
		title.textContent = stepName;
		header.appendChild(title);

		if (stepDefinition.date) {
			const date = document.createElement('div');
			date.className = 'history-detail-date';
			date.textContent = `Created ${this.formatDate(stepDefinition.date)}`;
			header.appendChild(date);
		}

		detailContent.appendChild(header);

		if (stepDefinition.description) {
			const description = document.createElement('div');
			description.className = 'history-detail-description';
			description.textContent = stepDefinition.description;
			detailContent.appendChild(description);
		}

		const varsSection = document.createElement('div');
		varsSection.className = 'history-detail-section';
		const varsHeader = document.createElement('h4');
		varsHeader.textContent = 'Variables';
		varsSection.appendChild(varsHeader);

		if (stepDefinition.vars && stepDefinition.vars.length > 0) {
			const varsList = document.createElement('ul');
			varsList.className = 'personal-step-vars-list';
			stepDefinition.vars.forEach((v: any) => {
				const li = document.createElement('li');
				li.textContent = `${v.name}${v.required ? ' (required)' : ''}`;
				if (v.default !== undefined && v.default !== '') {
					li.textContent += ` - default: ${v.default}`;
				}
				varsList.appendChild(li);
			});
			varsSection.appendChild(varsList);
		} else {
			const noVars = document.createElement('p');
			noVars.textContent = 'No variables';
			varsSection.appendChild(noVars);
		}

		detailContent.appendChild(varsSection);

		const actions = document.createElement('div');
		actions.className = 'history-detail-actions';

		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'btn-danger';
		deleteBtn.textContent = 'Delete Step';
		deleteBtn.addEventListener('click', () => {
			if (confirm(`Delete personal step "${stepName}"?`)) {
				const { deleteMyStep } = require('./custom-steps');
				deleteMyStep(stepName);
				this.renderHistoryList();
				detailContent.style.display = 'none';
				detailEmpty.style.display = 'block';
				toastService.showInBlueprintsDialog(`Deleted "${stepName}"`);
			}
		});

		actions.appendChild(deleteBtn);
		detailContent.appendChild(actions);
	}
}
