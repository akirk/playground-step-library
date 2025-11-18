/**
 * Main application entry point
 *
 * REFACTORING STATUS:
 * ✅ COMPLETED EXTRACTIONS:
 * - types.ts - TypeScript interfaces
 * - utils.ts - Utility functions
 * - app-state.ts - Shared application state
 * - content-detection.ts - URL and content type detection
 * - dom-utils.ts - DOM manipulation utilities
 * - ace-editor.ts - Ace Editor management
 * - my-blueprints.ts - Blueprint history/saved blueprints
 * - playground-integration.ts - Playground URL parsing
 * - blueprint-compiler.ts - State compression/decompression
 * - drag-drop.ts - Drag and drop utilities
 * - custom-steps.ts - My Steps management
 * - state-migration.ts - Backward compatibility migrations
 * - query-params.ts - URL query parameter parsing
 * - step-renderer.ts - Step DOM element creation with DI
 * - step-inserter.ts - Step insertion functions with DI
 * - wizard.ts - Complete wizard module with state management (874 lines)
 *
 * 🔄 REMAINING OPPORTUNITIES (tightly coupled with DOM/UI):
 * - Blueprint transformation (transformJson function ~130 lines)
 *   Reason: Direct DOM element access throughout
 * - Event handlers (paste, click, drag events)
 *   Reason: Event delegation pattern requires access to multiple DOM trees
 * - Step capture/restore functions
 *   Reason: Coupled with DOM element traversal and UI state
 * - History UI rendering
 *   Reason: Heavy DOM manipulation and event binding
 * - Label generation
 *   Reason: DOM traversal and element inspection
 *
 * REFACTORING STRATEGY:
 * The remaining ~4,200 lines are primarily event handlers and DOM-coupled UI logic.
 * Further extraction would require:
 * 1. Dependency injection for DOM elements
 * 2. Event bus/pub-sub pattern for decoupling
 * 3. View/ViewModel separation
 * This would be a larger architectural change beyond simple module extraction.
 */
// @ts-nocheck
import PlaygroundStepLibrary from '../index';
import { StepDefinition, ShowCallbacks } from './types';
import {
	minimalEncode,
	shortenUrl,
	expandUrl,
	isDefaultValue,
	encodeStringAsBase64,
	decodeBase64ToString,
	generateLabel
} from './utils';
import {
	loadAceEditor,
	getAceTheme,
	updateAllAceEditorThemes,
	initBlueprintAceEditor,
	initHistoryBlueprintAceEditor,
	cleanupHistoryBlueprintAceEditor,
	initCodeEditorAce,
	initViewSourceAceEditor,
	cleanupAceEditor,
	blueprintAceEditor,
	setBlueprintAceValue,
	viewSourceAceEditor
} from './ace-editor';
import { fixMouseCursor, makeParentStepDraggable, makeParentStepUnDraggable } from './dom-utils';
import {
	detectUrlType,
	detectWpAdminUrl,
	detectHtml,
	detectPhp,
	isPlaygroundDomain,
	detectPlaygroundUrl,
	detectPlaygroundQueryApiUrl
} from './content-detection';
import { showCallbacks, isManualEditMode, setBlueprint, setLinkedTextarea, getBlueprint } from './app-state';
import {
	getHistory,
	saveHistory,
	addBlueprintToHistory,
	addBlueprintToHistoryWithId,
	deleteBlueprintFromHistory,
	renameBlueprintInHistory,
	getBlueprintFromHistory,
	isBlueprintInHistory,
	type BlueprintHistoryEntry
} from './my-blueprints';
import { parsePlaygroundQueryApi, shouldUseMuPlugin } from './playground-integration';
import { compressState, uncompressState, extractStepDataFromElement, type StepConfig } from './blueprint-compiler';
import { getDragAfterElement } from './drag-drop';
import { getMySteps, saveMyStep as saveMyStepToStorage, deleteMyStep, renameMyStep } from './custom-steps';
import { migrateState } from './state-migration';
import { parseQueryParamsForBlueprint } from './query-params';
import { createStep } from './step-renderer';
import {
	addStepFromUrl,
	addLandingPageStep,
	addPostStepFromHtml,
	addStepFromPhp,
	type StepInserterDependencies
} from './step-inserter';
import {
	updateBlueprintSizeWarning,
	handleSplitViewMode,
	updateIframeSrc,
	type BlueprintUIDependencies
} from './blueprint-ui';
import { toastService } from './toast-service';
import { generateLabel } from './label-generator';
import {
	generateRedirectUrl,
	copyToClipboard,
	shareUrl,
	initMoreOptionsDropdown,
	setupDropdownCloseHandler,
	type URLControllerDependencies
} from './url-controller';
import { blueprintEventBus } from './blueprint-event-bus';
import { HistoryController, type HistoryControllerDependencies } from './history-controller';
import { StepLibraryController, type StepLibraryControllerDependencies } from './step-library-controller';
import { BlueprintCompilationController, type BlueprintCompilationControllerDependencies } from './blueprint-compilation-controller';
import { PasteHandlerController, type PasteHandlerControllerDependencies } from './paste-handler-controller';
import { StateController, type StateControllerDependencies } from './state-controller';
import { EventHandlersController, type EventHandlersControllerDependencies } from './event-handlers-controller';
import {
	initWizard,
	getWizardState,
	removeWizardStep,
	removeWizardPlugin,
	removeWizardTheme,
	updateWizardPluginList,
	updateWizardThemeList,
	finishWizard,
	resetWizardState,
	type WizardDependencies
} from './wizard';

declare global {
	interface Window {
		stepCompiler: PlaygroundStepLibrary;
		removeWizardStep: (stepName: string, wizardStep: number) => void;
		removeWizardPlugin: (index: number) => void;
		removeWizardTheme: (index: number) => void;
		goatcounter?: any;
		ace?: any;
	}
}

addEventListener('DOMContentLoaded', function () {
	const compiler = new PlaygroundStepLibrary();
	const customSteps = compiler.getAvailableSteps() as Record<string, StepDefinition>;

	window.stepCompiler = compiler;
	const stepList = document.getElementById('step-library')!;
	const blueprintSteps = document.getElementById('blueprint-steps')!;

	// Note: showCallbacks and isManualEditMode are imported from app-state.ts
	// URL detection functions are imported from content-detection.ts
	// DOM utility functions (fixMouseCursor, etc.) are imported from dom-utils.ts
	// createStep is now imported from step-renderer.ts

	// Helper functions to get/set blueprint value from Ace editor or textarea
	function getBlueprintValue(): string {
		if (blueprintAceEditor) {
			return blueprintAceEditor.getValue();
		}
		const textarea = document.getElementById('blueprint-compiled') as HTMLTextAreaElement;
		return textarea ? textarea.value : '';
	}

	function setBlueprintValue(value: string): void {
		if (blueprintAceEditor) {
			blueprintAceEditor.setValue(value, -1);
		}
		const textarea = document.getElementById('blueprint-compiled') as HTMLTextAreaElement;
		if (textarea) {
			textarea.value = value;
		}
	}

	// Initialize Step Library Controller
	const stepLibraryControllerDeps: StepLibraryControllerDependencies = {
		stepList,
		customSteps,
		showCallbacks
	};
	const stepLibraryController = new StepLibraryController(stepLibraryControllerDeps);
	stepLibraryController.initializeStepLibrary();

	// Initialize State Controller
	const stateControllerDeps: StateControllerDependencies = {
		blueprintSteps,
		stepList
	};
	const stateController = new StateController(stateControllerDeps);

	// Create refs for mutable state shared with event handlers
	const aceEditorRef = { current: null as any };
	const linkedTextareaRef = { current: null as HTMLTextAreaElement | null };

	function saveMyStep() {
		const myStepNameEl = document.getElementById('my-step-name');
		const saveStepEl = document.getElementById('save-step');

		if (!(myStepNameEl instanceof HTMLInputElement) || !(saveStepEl instanceof HTMLDialogElement)) {
			return;
		}

		const myStepName = myStepNameEl.value;
		const stepData = saveStepEl.dataset.step;
		if (!stepData) return;

		const myStep = JSON.parse(stepData);
		stepLibraryController.insertMyStep(myStepName, myStep);
		saveMyStepToStorage(myStepName, myStep);
		saveStepEl.close();
		myStepNameEl.value = '';
	}

	document.addEventListener('dragstart', (event) => {
		if (!(event.target instanceof Element)) return;

		if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.target.classList.contains('step')) {
			event.target.classList.add('dragging');
		}
	});

	document.addEventListener('dragend', (event) => {
		if (!(event.target instanceof Element)) return;

		if (event.target.classList.contains('step')) {
			event.target.classList.remove('dragging');
			blueprintEventBus.emit('blueprint:updated');
		}
	});

	let blueprintDropZoneActive = false;

	document.body.addEventListener('dragover', (event) => {
		const items = event.dataTransfer?.items;
		if (!items) {
			return;
		}

		const hasFile = Array.from(items).some(item => item.kind === 'file');
		if (!hasFile) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

		if (!blueprintDropZoneActive) {
			blueprintDropZoneActive = true;
			document.body.classList.add('blueprint-drop-active');
		}
	});

	document.body.addEventListener('dragleave', (event) => {
		if (event.target === document.body || (event.relatedTarget instanceof Node && !document.body.contains(event.relatedTarget))) {
			blueprintDropZoneActive = false;
			document.body.classList.remove('blueprint-drop-active');
		}
	});

	document.body.addEventListener('drop', (event) => {
		const files = event.dataTransfer?.files;
		if (!files || files.length === 0) {
			return;
		}

		const isStepDrag = event.dataTransfer?.effectAllowed === 'move';
		if (isStepDrag) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		blueprintDropZoneActive = false;
		document.body.classList.remove('blueprint-drop-active');

		handleBlueprintFileDrop(files[0]);
	});

	async function handleBlueprintFileDrop(file: File) {
		if (!file.name.endsWith('.json')) {
			showMyBlueprintsToast('Please drop a JSON file');
			return;
		}

		try {
			const text = await file.text();
			const data = JSON.parse(text);

			let nativeBlueprint = null;
			let title = 'Imported Blueprint';

			if (data.blueprints && Array.isArray(data.blueprints)) {
				if (data.blueprints.length === 0) {
					showMyBlueprintsToast('No blueprints found in file');
					return;
				}

				if (data.blueprints.length > 1) {
					const choice = confirm('This file contains ' + data.blueprints.length + ' blueprints. Load the first one?');
					if (!choice) {
						return;
					}
				}

				const firstBlueprint = data.blueprints[0];
				if (firstBlueprint.compiledBlueprint) {
					nativeBlueprint = firstBlueprint.compiledBlueprint;
					title = firstBlueprint.title || title;
				} else {
					nativeBlueprint = firstBlueprint;
				}
			} else if (data.compiledBlueprint) {
				nativeBlueprint = data.compiledBlueprint;
				title = data.title || title;
			} else if (data.steps || data.landingPage) {
				nativeBlueprint = data;
			} else {
				showMyBlueprintsToast('Unrecognized blueprint format');
				return;
			}

			const { BlueprintDecompiler } = await import('../decompiler');
			const decompiler = new BlueprintDecompiler();
			const result = decompiler.decompile(nativeBlueprint);

			if (result.warnings.length > 0) {
				console.warn('Decompiler warnings:', result.warnings);
			}

			const stepConfig = {
				steps: result.steps.map(step => {
					const vars = {};
					for (const key in step) {
						if (key !== 'step') {
							vars[key] = step[key];
						}
					}
					return {
						step: step.step,
						vars: vars
					};
				})
			};

			restoreSteps(stepConfig, title);

			if (result.unmappedSteps.length === 0) {
				showMyBlueprintsToast('Blueprint loaded successfully!');
			} else {
				const stepTypes = result.unmappedSteps.map(s => s.step || 'unknown').filter((v, i, a) => a.indexOf(v) === i);
				const msg = 'Blueprint loaded. Ignored ' + result.unmappedSteps.length + ' step(s): ' + stepTypes.join(', ');
				showMyBlueprintsToast(msg);
				console.warn('Unmapped steps:', result.unmappedSteps);
			}

		} catch (error) {
			console.error('Blueprint import error:', error);
			const message = error instanceof Error ? error.message : String(error);
			showMyBlueprintsToast('Failed to load blueprint: ' + message);
		}
	}

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			const viewSourceDialog = document.getElementById('view-source');
			if (viewSourceDialog instanceof HTMLDialogElement) {
				if (viewSourceDialog.open) {
					document.body.classList.remove('dialog-open');
				}
				viewSourceDialog.close();
			}
		}
	});

	function insertStep(step: Element) {
		const stepElement = step.closest('.step');
		const stepClone = stepElement.cloneNode(true);
		stepClone.removeAttribute('id');
		blueprintSteps.appendChild(stepClone);
		stepClone.classList.remove('dragging');
		stepClone.classList.remove('hidden');
		stepClone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
		blueprintEventBus.emit('blueprint:updated');
		stepClone.querySelector('input,textarea')?.focus();

		if (window.goatcounter && stepElement.dataset.step) {
			window.goatcounter.count({
				path: 'step-used/' + stepElement.dataset.step,
				title: 'Step Used: ' + stepElement.dataset.step,
				event: true
			});
		}

		// Hide the mobile step library overlay after adding a step
		const stepLibraryHolder = document.getElementById('step-library-holder');
		if (stepLibraryHolder) {
			stepLibraryHolder.classList.remove('mobile-visible');
		}
	}

	document.addEventListener('keyup', (event) => {
		if (event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}
		if (!(event.target instanceof Element)) return;

		if ((event.target as HTMLElement).id === 'blueprint-compiled') {
			return;
		}
		if (event.key === 'Enter') {
			if (event.target.closest('#save-step')) {
				return saveMyStep();
			}
			if (event.target.closest('#step-library .step')) {
				insertStep(event.target);
				return false;
			}
			if (event.target.closest('#filter')) {
				const stepLibrary = document.getElementById('step-library');
				if (stepLibrary && stepLibrary.querySelectorAll('.step:not(.hidden)').length === 1) {
					const step = stepLibrary.querySelector('.step:not(.hidden)');
					if (step) insertStep(step);
				}
				return false;
			}
			if (event.target.closest('input') && !event.target.closest('.ace_search_form')) {
				blueprintEventBus.emit('blueprint:updated');
				const playgroundLink = document.getElementById('playground-link');
				if (playgroundLink instanceof HTMLElement) playgroundLink.click();
				return false;
			}
		}
		if (event.key == 'Escape') {
			const closestInput = event.target.closest('input,textarea');
			if (closestInput instanceof HTMLElement) {
				closestInput.blur();
				return false;
			}
		}
		if (event.target.closest('#step-library .step')) {
			if (event.key === 'Escape') {
				const stepEl = event.target.closest('.step');
				if (stepEl instanceof HTMLElement) stepEl.blur();
			} else if (event.key === 'ArrowDown') {
				const focused = stepList.querySelector('.step:focus');
				let nextStep = focused?.nextElementSibling;
				while (nextStep && nextStep.classList.contains('hidden')) {
					if (!nextStep) {
						break;
					}
					nextStep = nextStep.nextElementSibling;
				}
				if (nextStep instanceof HTMLElement) {
					nextStep.focus();
				}
				return false;
			} else if (event.key === 'ArrowUp') {
				const focused = stepList.querySelector('.step:focus');
				let prevStep = focused?.previousElementSibling;
				while (prevStep && prevStep.classList.contains('hidden')) {
					if (!prevStep) {
						break;
					}
					prevStep = prevStep.previousElementSibling;
				}
				if (prevStep instanceof HTMLElement) {
					prevStep.focus();
				}
				return false;
			}
		}

		if (!event.target.closest('input,textarea')) {
			if (event.key.match(/^[a-z0-9]$/i) && !event.ctrlKey && !event.altKey && !event.metaKey) {
				const filterEl = document.getElementById('filter');
				if (filterEl instanceof HTMLInputElement) {
					filterEl.value = event.key;
					filterEl.focus();
					filterEl.dispatchEvent(new Event('keyup'));
				}
				return;
			} else if (event.key === 'ArrowUp') {
				stepList.querySelector('.step:last-child').focus();
				return;
			} else if (event.key === 'ArrowDown') {
				stepList.querySelector('.step').focus();
				return;
			}
		}

		blueprintEventBus.emit('blueprint:updated');
	});
	document.addEventListener('change', (event) => {
		if ( event.target.id === 'mode' || event.target.id === 'preview-mode' || event.target.id === 'exclude-meta' ) {
			blueprintEventBus.emit('blueprint:updated');
			return;
		}
		if ( event.target.name === 'blueprint-version' ) {
			transformJson();
			return;
		}
		if (!event.target.closest('#blueprint')) {
			return;
		}
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
			blueprintEventBus.emit('blueprint:updated');
			return;
		}
	});
	document.addEventListener('dblclick', (event) => {
		if (!(event.target instanceof Element)) return;

		if (event.target.classList.contains('stepname')) {
			const step = event.target.closest('.step');
			if (step?.parentNode) {
				step.parentNode.childNodes.forEach(function (s: Node) {
					if (s instanceof Element) {
						s.classList.toggle('collapsed');
					}
				});
			}
			return false;
		}
	});
	// makeParentStepDraggable, makeParentStepUnDraggable, and fixMouseCursor are now imported from dom-utils.ts

	// Initialize Event Handlers Controller
	const eventHandlersControllerDeps: EventHandlersControllerDependencies = {
		customSteps,
		showCallbacks,
		stateController,
		insertStep: (target: EventTarget) => insertStep(target as Element),
		saveMyStep,
		loadCombinedExamples,
		aceEditorRef,
		linkedTextareaRef
	};
	const eventHandlersController = new EventHandlersController(eventHandlersControllerDeps);
	eventHandlersController.setupEventListeners();

	// Click event handler moved to EventHandlersController
	blueprintSteps.addEventListener('dragover', (event) => {
		event.preventDefault();
	});

	blueprintSteps.addEventListener('drop', (event) => {
		event.preventDefault();

		const droppedStep = document.querySelector('.dragging');
		if (droppedStep && droppedStep.parentNode === stepList) {
			const stepClone = droppedStep.cloneNode(true);
			blueprintSteps.appendChild(stepClone);
			stepClone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
			stepClone.classList.remove('dragging');
		}
	});

	// Enable reordering of blocks within block area
	blueprintSteps.addEventListener('dragover', (event) => {
		const draggable = document.querySelector('.dragging');
		if (!draggable || draggable.parentNode === stepList) {
			return;
		}
		event.preventDefault();
		const afterElement = getDragAfterElement(blueprintSteps, event.clientY);
		if (afterElement == null) {
			blueprintSteps.appendChild(draggable);
		} else {
			blueprintSteps.insertBefore(draggable, afterElement);
		}
		blueprintEventBus.emit('blueprint:updated');
	});

	// Remove block when dragged out
	blueprintSteps.addEventListener('dragleave', (event) => {
		const draggable = document.querySelector('.dragging');
		if (!draggable || draggable.parentNode === stepList) {
			return;
		}
		if (event.relatedTarget === null || !blueprintSteps.contains(event.relatedTarget)) {
			const removedBlock = document.querySelector('.dragging');
			if (removedBlock) {
				removedBlock.remove();
			}
		}
		blueprintEventBus.emit('blueprint:updated');
	});

	// detectUrlType, detectWpAdminUrl are now imported from content-detection.ts
	// Step insertion functions are now imported from step-inserter.ts

	// detectHtml, detectPhp, isPlaygroundDomain, detectPlaygroundUrl, and detectPlaygroundQueryApiUrl
	// are now imported from content-detection.ts
	// parsePlaygroundQueryApi is now imported from playground-integration.ts

	// Paste handler is now managed by paste-handler-controller.ts

	// getDragAfterElement is now imported from drag-drop.ts

	document.getElementById('clear').addEventListener('click', function () {
		document.getElementById('title').value = '';
		blueprintSteps.textContent = '';
		const draghint = document.createElement('div');
		draghint.id = 'draghint';
		draghint.textContent = 'Click or drag the steps to add them here.';
		blueprintSteps.appendChild(draghint);
		document.getElementById('examples').value = 'Examples';
		blueprintEventBus.emit('blueprint:updated');
	});

	function downloadBlueprint() {
		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'download-blueprint',
				title: 'Download Blueprint',
				event: true
			});
		}
		const blueprintContent = getBlueprintValue();
		let title = document.getElementById('title').value;

		if (!title || !title.trim()) {
			const stepBlocks = blueprintSteps.querySelectorAll('.step');
			const pluginSteps = Array.from(stepBlocks).filter(block => block.dataset.step === 'installPlugin');
			const hasLandingPage = Array.from(stepBlocks).some(block => block.dataset.step === 'setLandingPage');

			if (pluginSteps.length === 1) {
				const pluginSlug = pluginSteps[0].querySelector('[name="pluginData"]')?.value ||
					pluginSteps[0].querySelector('[name="slug"]')?.value ||
					pluginSteps[0].querySelector('[name="url"]')?.value;
				if (pluginSlug && pluginSlug.trim()) {
					const parts = pluginSlug.split('/').filter(p => p.trim());
					const slug = parts[parts.length - 1].replace(/\.zip$/, '');
					title = 'blueprint-' + slug + (hasLandingPage ? '-landingpage' : '');
				}
			}
		}

		if (!title || !title.trim()) {
			title = 'blueprint';
		}

		const filename = title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';
		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(blueprintContent);
		const downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute('download', filename);
		downloadAnchor.click();
	}

	window.addEventListener('popstate', function (event) {
		if (event.state) {
			stateController.restoreState(event.state);
		}
	});

	window.addEventListener('hashchange', function () {
		if (location.hash) {
			stateController.restoreState(uncompressState(location.hash.replace(/^#+/, '')));
		}
	});

	// Filter and show-builtin event listeners are now handled by step-library-controller.ts

	// Handle title input changes
	document.addEventListener('input', function (e) {
		if ( e.target.id === 'title' ) {
			blueprintEventBus.emit('blueprint:updated');
		}
	});

	// compressState and uncompressState are now imported from blueprint-compiler.ts
	// Wrapper function to gather DOM values and call the imported compressState
	function updateVariableVisibility(stepBlock) {
		stepBlock.querySelectorAll('input,select,textarea,button').forEach(function (input) {
			if (!input || typeof showCallbacks[stepBlock.dataset.step] === 'undefined' || typeof showCallbacks[stepBlock.dataset.step][input.name] !== 'function') {
				return;
			}
			const tr = input.closest('tr');
			if (showCallbacks[stepBlock.dataset.step][input.name](stepBlock)) {
				tr.style.display = '';
			} else {
				tr.style.display = 'none';
			}
		});
	}
	// getStepData is now extracted to blueprint-compiler.ts as extractStepDataFromElement
	function getStepData(stepBlock) {
		return extractStepDataFromElement(stepBlock);
	}

	let lastCompressedState = '';

	function loadCombinedExamples() {
		const combinedExamples = {};
		if (document.getElementById('title').value) {
			combinedExamples.title = document.getElementById('title').value;
		}
		combinedExamples.landingPage = '/';
		combinedExamples.steps = [];
		const state = [];

		blueprintSteps.querySelectorAll('.step').forEach(function (stepBlock) {
			updateVariableVisibility(stepBlock);
			const step = getStepData(stepBlock);
			state.push(step);
			combinedExamples.steps = combinedExamples.steps.concat(step);
		});

		if (combinedExamples.steps.length > 0) {
			const draghint = document.getElementById('draghint');
			if (draghint) {
				draghint.style.display = 'none';
			}
		} else {
			const draghint = document.getElementById('draghint');
			if (draghint) {
				draghint.style.display = '';
			}
		}

		setBlueprint(JSON.stringify(combinedExamples, null, 2));

		const currentCompressedState = stateController.compressStateFromDOM(state);

		// Only update history and transform JSON if the state has changed
		if (currentCompressedState !== lastCompressedState) {
			lastCompressedState = currentCompressedState;
			history.pushState(state, '', '#' + currentCompressedState);
			transformJson();
		}
	}

	// Subscribe to blueprint:updated events to trigger loadCombinedExamples
	blueprintEventBus.on('blueprint:updated', () => {
		loadCombinedExamples();
	});

	// Dependencies for step inserter functions
	const stepInserterDeps: StepInserterDependencies = {
		blueprintSteps,
		customSteps,
		showCallbacks
	};

	// Dependencies for blueprint UI functions
	const blueprintUIDeps: BlueprintUIDependencies = {
		playgroundIframe: document.getElementById('playground-iframe') as HTMLIFrameElement
	};

	// Dependencies for URL controller
	const urlControllerDeps: URLControllerDependencies = {
		blueprintSteps,
		customSteps
	};

	// Initialize Blueprint Compilation Controller
	const blueprintCompilationControllerDeps: BlueprintCompilationControllerDependencies = {
		getBlueprintValue,
		setBlueprintValue,
		blueprintUIDeps
	};
	const blueprintCompilationController = new BlueprintCompilationController(blueprintCompilationControllerDeps);

	function transformJson() {
		blueprintCompilationController.transformJson();
	}

	// transformJson is now handled by blueprint-compilation-controller.ts

	// updateBlueprintSizeWarning, handleSplitViewMode, updateIframeSrc are now imported from blueprint-ui.ts

	// migrateState is now imported from state-migration.ts


	// parseQueryParamsForBlueprint is now imported from query-params.ts


	// Detect if page was accessed via reload (F5, Ctrl+R, etc.)
	// Use modern Performance Navigation API
	const pageAccessedByReload = (() => {
		try {
			const navigationEntry = performance.getEntriesByType('navigation')[0];
			return navigationEntry && navigationEntry.type === 'reload';
		} catch (e) {
			// Fallback: check if document.referrer is the same as current URL
			// This catches most reload cases across browsers
			return document.referrer === window.location.href;
		}
	})();

	const queryParamBlueprint = parseQueryParamsForBlueprint();
	if (queryParamBlueprint) {
		stateController.restoreState({ steps: queryParamBlueprint.steps });
		// Clear step[] and url[] parameters from URL to prevent conflicts with hash state
		const newUrl = new URL(window.location);
		newUrl.search = '';
		history.replaceState(null, '', newUrl.pathname + newUrl.hash);
		if (queryParamBlueprint.redir && !document.getElementById('preview-mode').value && !pageAccessedByReload) {
			stateController.autoredirect(queryParamBlueprint.redir);
		}
	} else if (location.hash) {
		stateController.restoreState(uncompressState(location.hash.replace(/^#+/, '')));
		if (!document.getElementById('preview-mode').value && blueprintSteps.querySelectorAll('.step').length && !pageAccessedByReload) {
			stateController.autoredirect();
		}
	} else {
		blueprintEventBus.emit('blueprint:updated');
	}
	const examples = {
		'Interactivity API Todo list MVC': [
			{
				'step': 'addPage',
				'vars': {
					'postTitle': '',
					'postContent': '<!-- wp:to-do-mvc/to-do-mvc /-->',
					'homepage': true
				}
			},
			{
				'step': 'githubPluginRelease',
				'vars': {
					'repo': 'ryanwelcher/interactivity-api-todomvc',
					'release': 'v0.1.3',
					'filename': 'to-do-mvc.zip'
				}
			},
			{
				'step': 'login',
				'vars': {
					'username': 'admin',
					'password': 'password',
					'landingPage': false
				}
			}
		],
		'ActivityPub plugin preview': [
			{
				'step': 'installPlugin',
				'vars': {
					'url': 'activitypub',
					'permalink': true
				}
			},
			{
				'step': 'showAdminNotice',
				'vars': {
					'text': 'Welcome to this demo of the ActivityPub plugin',
					'type': 'info',
					'dismissible': false
				}
			},
			{
				'step': 'setSiteName',
				'vars': {
					'sitename': 'ActivityPub Demo',
					'tagline': 'Trying out WordPress Playground.'
				}
			},
			{
				'step': 'createUser',
				'vars': {
					'username': 'demo',
					'password': 'password',
					'role': 'administrator',
					'display_name': 'Demo User',
					'email': '',
					'login': true
				}
			},
			{
				'step': 'setLandingPage',
				'vars': {
					'landingPage': '/wp-admin/admin.php?page=activitypub'
				}
			}
		],
		'Load Feeds into the Friends plugin': [
			{
				'step': 'setLandingPage',
				'vars': {
					'landingPage': '/friends/'
				}
			},
			{
				'step': 'importFriendFeeds',
				'vars': {
					'opml': 'https://alex.kirk.at Alex Kirk\nhttps://adamadam.blog Adam Zieliński'
				}
			}
		],
		"Show the available PHP extensions + PHPinfo": [
			{
				"step": "addFilter",
				"vars": {
					"filter": "init",
					"code": "$e = get_loaded_extensions(); sort( $e ); echo '<div style=\"float:left; margin-left: 1em\">AvailableExtensions:<ul><li>', implode('</li><li>', $e ), '</li></ul></div>'; phpinfo()",
					"priority": "10"
				}
			}
		]
	};

	Object.keys(examples).forEach(function (example) {
		const option = document.createElement('option');
		option.value = example;
		option.innerText = example;
		document.getElementById('examples').appendChild(option);
	});
	document.getElementById('examples').addEventListener('change', function () {
		if ('Examples' === this.value) {
			return;
		}
		document.getElementById('title').value = this.value;
		stateController.restoreState({ steps: examples[this.value] });
		blueprintEventBus.emit('blueprint:updated');
	});
	stepLibraryController.clearFilter();

	// Wizard Mode Implementation
	// Initialize wizard with dependencies
	const wizardDeps: WizardDependencies = {
		customSteps,
		setBlueprintValue,
		createStep,
		showCallbacks,
		blueprintSteps
	};

	initWizard(wizardDeps);

	// Make wizard functions globally accessible
	window.removeWizardStep = removeWizardStep;
	window.removeWizardPlugin = removeWizardPlugin;
	window.removeWizardTheme = removeWizardTheme;

	// Manual Edit Mode functionality
	const blueprintTextarea = document.getElementById('blueprint-compiled');

	blueprintTextarea.addEventListener('focus', function () {
		initBlueprintAceEditor(getBlueprintValue, isManualEditMode, transformJson);
	});

	blueprintTextarea.addEventListener('click', function () {
		initBlueprintAceEditor(getBlueprintValue, isManualEditMode, transformJson);
	});

	// Intercept playground link clicks to regenerate URL if in manual edit mode
	document.getElementById('playground-link').addEventListener('click', function (e) {
		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'launch-playground',
				title: 'Launch in Playground',
				event: true
			});
		}

		// Show save prompt only if blueprint hasn't been saved yet
		const blueprintString = getBlueprintValue();
		if (blueprintString && blueprintString.trim() && !isBlueprintAlreadySaved()) {
			showSavePromptToast();
		}

		if (isManualEditMode.value) {
			e.preventDefault();
			transformJson();
			// Allow the click to proceed after transformJson updates the href
			setTimeout(() => {
				window.open(document.getElementById('playground-link').href, '_blank');
			}, 0);
		}
	});


	// generateRedirectUrl and dropdown functions are now imported from url-controller.ts

	// Setup dropdown close handler
	setupDropdownCloseHandler();

	const mainDropdown = document.getElementById('more-options-dropdown');
	if (mainDropdown) {
		initMoreOptionsDropdown(mainDropdown);
	}

	const moreOptionsMenu = document.getElementById('more-options-menu');

	document.getElementById('copy-playground-url-menu').addEventListener('click', async function (e) {
		const playgroundUrl = (document.getElementById('playground-link') as HTMLAnchorElement).href;
		const button = e.currentTarget as HTMLElement;
		const originalContent = button.cloneNode(true);
		const success = await copyToClipboard(playgroundUrl);
		if (success) {
			showCopiedFeedback(button, originalContent);
		}
	});

	document.getElementById('download-blueprint-menu').addEventListener('click', function () {
		moreOptionsMenu.style.display = 'none';
		downloadBlueprint();
	});

	document.getElementById('share-url-menu').addEventListener('click', async function (e) {

		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'share-url',
				title: 'Share URL',
				event: true
			});
		}

		try {
			const redirectUrl = generateRedirectUrl(1, false, urlControllerDeps);

			if (!redirectUrl) {
				console.error('No steps found');
				return;
			}

			const button = e.currentTarget as HTMLElement;
			const originalContent = button.cloneNode(true);
			const title = (document.getElementById('title') as HTMLInputElement).value || 'WordPress Playground Blueprint';

			const result = await shareUrl(redirectUrl, title);

			if (result === 'shared' || result === 'copied') {
				if (result === 'copied') {
					showCopiedFeedback(button, originalContent);
				} else {
					moreOptionsMenu.style.display = 'none';
				}
			}
		} catch (err) {
			console.error('Error in share-url handler:', err);
		}
	});

	// copyToClipboard is now imported from url-controller.ts

	function showCopiedFeedback(button: HTMLElement, originalContent: Node) {
		button.textContent = '✓ Copied!';
		setTimeout(() => {
			button.textContent = '';
			while (originalContent.firstChild) {
				button.appendChild(originalContent.firstChild);
			}
			if (moreOptionsMenu) {
				moreOptionsMenu.style.display = 'none';
			}
		}, 1500);
	}

	document.getElementById('copy-redirect-url-menu').addEventListener('click', async function (e) {

		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'copy-redirect-url',
				title: 'Copy Redirect URL',
				event: true
			});
		}

		try {
			const redirectUrl = generateRedirectUrl(1, true, urlControllerDeps);

			if (!redirectUrl) {
				console.error('No steps found');
				return;
			}

			const button = e.currentTarget as HTMLElement;
			const originalContent = button.cloneNode(true);
			const success = await copyToClipboard(redirectUrl);
			if (success) {
				showCopiedFeedback(button, originalContent);
			}
		} catch (err) {
			console.error('Error in copy-redirect-url handler:', err);
		}
	});

	// History functionality is now handled by history-controller.ts
	// Save dialog needs to be created after historyController is initialized
	let historyController: HistoryController;

	function showSaveBlueprintDialog(defaultName, isOverwrite) {
		const dialog = document.getElementById('save-blueprint-dialog');
		const messageDiv = document.getElementById('save-blueprint-message');
		const nameInput = document.getElementById('save-blueprint-name');
		const nameLabel = document.getElementById('save-blueprint-label');
		const overwriteBtn = document.getElementById('save-blueprint-overwrite');
		const renameBtn = document.getElementById('save-blueprint-rename');
		const saveBtn = document.getElementById('save-blueprint-save');
		const cancelBtn = document.getElementById('save-blueprint-cancel');

		nameInput.value = defaultName;

		if (isOverwrite) {
			messageDiv.textContent = `A blueprint with this name already exists. Do you want to overwrite it or choose a new name?`;
			messageDiv.style.display = 'block';
			nameLabel.style.display = 'none';
			overwriteBtn.style.display = 'inline-block';
			renameBtn.style.display = 'inline-block';
			saveBtn.style.display = 'none';
		} else {
			messageDiv.textContent = '';
			messageDiv.style.display = 'none';
			nameLabel.style.display = 'block';
			overwriteBtn.style.display = 'none';
			renameBtn.style.display = 'none';
			saveBtn.style.display = 'inline-block';
		}

		const handleOverwrite = function () {
			const title = defaultName;
			const history = getHistory();
			const updatedHistory = history.filter(entry => entry.title !== title);
			saveHistory(updatedHistory);

			historyController.addToHistory(title);
			const titleInput = document.getElementById('title');
			if (titleInput) {
				titleInput.value = title;
			}
			showToast('Updated');
			historyController.renderHistoryList();

			dialog.close();
			cleanup();
		};

		const handleRename = function () {
			messageDiv.textContent = '';
			messageDiv.style.display = 'none';
			nameLabel.style.display = 'block';
			overwriteBtn.style.display = 'none';
			renameBtn.style.display = 'none';
			saveBtn.style.display = 'inline-block';
			nameInput.select();
		};

		const handleSave = function () {
			const title = nameInput.value.trim();
			if (!title) {
				return;
			}

			const history = getHistory();
			const existingEntry = history.find(entry => entry.title === title);

			if (existingEntry) {
				showSaveBlueprintDialog(title, true);
				cleanup();
				return;
			}

			historyController.addToHistory(title);
			const titleInput = document.getElementById('title');
			if (titleInput) {
				titleInput.value = title;
			}
			showToast('Saved');
			historyController.renderHistoryList();

			dialog.close();
			cleanup();
		};

		const handleCancel = function () {
			dialog.close();
			cleanup();
		};

		const handleKeyDown = function (e) {
			if (e.key === 'Enter' && nameLabel.style.display !== 'none') {
				e.preventDefault();
				handleSave();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				handleCancel();
			}
		};

		const cleanup = function () {
			overwriteBtn.removeEventListener('click', handleOverwrite);
			renameBtn.removeEventListener('click', handleRename);
			saveBtn.removeEventListener('click', handleSave);
			cancelBtn.removeEventListener('click', handleCancel);
			nameInput.removeEventListener('keydown', handleKeyDown);
		};

		overwriteBtn.addEventListener('click', handleOverwrite);
		renameBtn.addEventListener('click', handleRename);
		saveBtn.addEventListener('click', handleSave);
		cancelBtn.addEventListener('click', handleCancel);
		nameInput.addEventListener('keydown', handleKeyDown);

		dialog.showModal();
		if (!isOverwrite) {
			nameInput.select();
		}
	}

	// showToast and showMyBlueprintsToast are now provided by toast-service.ts
	const showToast = (message: string) => toastService.show(message);
	const showMyBlueprintsToast = (message: string, undoCallback?: () => void) => toastService.showWithUndo(message, undoCallback);


	function isBlueprintAlreadySaved() {
		const blueprintString = getBlueprintValue();
		if (!blueprintString || !blueprintString.trim()) {
			return true;
		}

		let compiledBlueprint;
		try {
			compiledBlueprint = JSON.parse(blueprintString);
		} catch (e) {
			return true;
		}

		const history = getHistory();
		if (history.length === 0) {
			return false;
		}

		const lastEntry = history[0];
		const lastBlueprintString = JSON.stringify(lastEntry.compiledBlueprint);
		const currentBlueprintString = JSON.stringify(compiledBlueprint);
		return lastBlueprintString === currentBlueprintString;
	}

	function showSavePromptToast() {
		const titleInput = document.getElementById('title') as HTMLInputElement;
		const blueprintTitle = titleInput && titleInput.value ? titleInput.value.trim() : '';

		const history = getHistory();
		const existingEntry = blueprintTitle ? history.find(entry => entry.title === blueprintTitle) : null;

		let message: string;
		let actionLabel: string;

		if (existingEntry) {
			message = `Update "${blueprintTitle}"?`;
			actionLabel = 'Update';
		} else if (blueprintTitle) {
			message = `Save as "${blueprintTitle}"?`;
			actionLabel = 'Save';
		} else {
			message = 'Save this blueprint?';
			actionLabel = 'Save';
		}

		toastService.showSavePrompt(message, actionLabel, () => {
			if (existingEntry) {
				const updatedHistory = history.filter(entry => entry.title !== blueprintTitle);
				saveHistory(updatedHistory);
				const entryId = historyController.addToHistoryWithId(blueprintTitle);
				if (entryId) {
					showToast('Updated');
					historyController.renderHistoryList();
				}
			} else if (blueprintTitle) {
				const entryId = historyController.addToHistoryWithId(blueprintTitle);
				if (entryId) {
					showToast('Saved');
					historyController.renderHistoryList();
				}
			} else {
				const defaultTitle = generateLabel();
				showSaveBlueprintDialog(defaultTitle, false);
			}
		});
	}

	const hideSavePromptToast = () => toastService.hide();

	function captureCurrentSteps() {
		const stepsData = {
			steps: []
		};

		document.querySelectorAll('#blueprint-steps .step').forEach(function (stepBlock) {
			const stepData = getStepData(stepBlock);
			if (stepData) {
				stepsData.steps.push(stepData);
			}
		});

		const options = {
			wpVersion: document.getElementById('wp-version').value,
			phpVersion: document.getElementById('php-version').value,
			phpExtensionBundles: document.getElementById('phpExtensionBundles')?.checked || false,
			mode: document.getElementById('mode').value,
			storage: document.getElementById('storage').value,
			autosave: document.getElementById('autosave').value,
			playground: document.getElementById('playground').value,
			encodingFormat: document.getElementById('encoding-format').value,
			previewMode: document.getElementById('preview-mode').value
		};

		const defaults = {
			wpVersion: 'latest',
			phpVersion: 'latest',
			phpExtensionBundles: false,
			mode: 'browser-full-screen',
			storage: 'none',
			autosave: '',
			playground: 'playground.wordpress.net',
			encodingFormat: 'auto',
			previewMode: ''
		};

		const isAllDefaults = Object.keys(options).every(function (key) {
			return options[key] === defaults[key];
		});

		if (!isAllDefaults) {
			stepsData.options = options;
		}

		const titleInput = document.getElementById('title');
		if (titleInput && titleInput.value) {
			stepsData.title = titleInput.value;
		}

		return stepsData;
	}

	// generateLabel is now imported from label-generator.ts

	function formatDate(isoString) {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) {
			return 'Just now';
		}
		if (diffMins < 60) {
			return diffMins + ' minute' + (diffMins !== 1 ? 's' : '') + ' ago';
		}
		if (diffHours < 24) {
			return diffHours + ' hour' + (diffHours !== 1 ? 's' : '') + ' ago';
		}
		if (diffDays < 7) {
			return diffDays + ' day' + (diffDays !== 1 ? 's' : '') + ' ago';
		}
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	// Save to History button
	document.getElementById('save-to-history-btn').addEventListener('click', function () {
		historyController.saveToHistoryWithName();
	});


	// Toast close button
	document.getElementById('history-toast-close').addEventListener('click', function () {
		hideSavePromptToast();
	});

	// Undo toast close button
	document.getElementById('undo-toast-close').addEventListener('click', function () {
		const toast = document.getElementById('undo-toast');
		toast.style.display = 'none';
		// Timeout is managed by toast-service.ts
	});


	function restoreSteps(stepsData, title) {
		if (!stepsData || !stepsData.steps) {
			return;
		}

		isManualEditMode.value = false;
		const manualEditBanner = document.getElementById('manual-edit-banner');
		if (manualEditBanner) {
			manualEditBanner.style.display = 'none';
		}

		const blueprintStepsContainer = document.getElementById('blueprint-steps');
		blueprintStepsContainer.textContent = '';
		const draghint = document.createElement('div');
		draghint.id = 'draghint';
		draghint.textContent = 'Click or drag the steps to add them here.';
		blueprintStepsContainer.appendChild(draghint);

		if (title) {
			document.getElementById('title').value = title;
		}

		const missingSteps = [];

		stepsData.steps.forEach(function (stepData) {
			const sourceStep = document.querySelector('#step-library .step[data-step="' + stepData.step + '"]');
			if (!sourceStep) {
				console.warn('Step not found in library:', stepData.step);
				missingSteps.push(stepData.step);
				return;
			}

			const stepBlock = sourceStep.cloneNode(true);
			stepBlock.removeAttribute('id');
			stepBlock.classList.remove('dragging');
			stepBlock.classList.remove('hidden');
			document.getElementById('blueprint-steps').appendChild(stepBlock);

			// Restore vars
			if (stepData.vars) {
				for (const key in stepData.vars) {
					const input = stepBlock.querySelector('[name="' + key + '"]');
					if (input) {
						if (input.type === 'checkbox') {
							input.checked = stepData.vars[key];
						} else {
							input.value = stepData.vars[key];
						}
					}
				}
			}

			// Restore count if present
			if (stepData.count) {
				const countInput = stepBlock.querySelector('[name="count"]');
				if (countInput) {
					countInput.value = stepData.count;
				}
			}
		});

		if (missingSteps.length > 0) {
			showMyBlueprintsToast('Warning: ' + missingSteps.length + ' step(s) not found: ' + missingSteps.join(', '));
		}

		if (stepsData.options) {
			const opts = stepsData.options;
			if (opts.wpVersion) {
				document.getElementById('wp-version').value = opts.wpVersion;
			}
			if (opts.phpVersion) {
				document.getElementById('php-version').value = opts.phpVersion;
			}
			if (opts.phpExtensionBundles !== undefined) {
				document.getElementById('phpExtensionBundles').checked = opts.phpExtensionBundles;
			}
			if (opts.mode) {
				document.getElementById('mode').value = opts.mode;
			}
			if (opts.storage) {
				document.getElementById('storage').value = opts.storage;
			}
			if (opts.autosave) {
				document.getElementById('autosave').value = opts.autosave;
			}
			if (opts.playground) {
				document.getElementById('playground').value = opts.playground;
			}
			if (opts.encodingFormat) {
				document.getElementById('encoding-format').value = opts.encodingFormat;
			} else if (opts.base64 !== undefined) {
				document.getElementById('encoding-format').value = opts.base64 ? 'base64' : 'auto';
			}
			if (opts.previewMode) {
				document.getElementById('preview-mode').value = opts.previewMode;
			}
		}

		blueprintEventBus.emit('blueprint:updated');
	}

	// Initialize History Controller
	const historyControllerDeps: HistoryControllerDependencies = {
		getBlueprintValue,
		captureCurrentSteps,
		restoreSteps,
		isBlueprintAlreadySaved,
		showSaveBlueprintDialog
	};
	historyController = new HistoryController(historyControllerDeps);

	// Initialize Paste Handler Controller
	const pasteHandlerControllerDeps: PasteHandlerControllerDependencies = {
		stepInserterDeps,
		restoreSteps
	};
	const pasteHandlerController = new PasteHandlerController(pasteHandlerControllerDeps);

	// History controller methods are now accessed directly via the historyController instance

	// Initialize empty blueprint if no steps are present
	if (blueprintSteps.querySelectorAll('.step').length === 0) {
		setBlueprintValue(JSON.stringify({}, null, 2));
	}
});
