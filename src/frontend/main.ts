/**
 * Main application entry point
 *
 */
import PlaygroundStepLibrary, { BlueprintDecompiler } from '../index';
import { StepDefinition, ShowCallbacks, StepData, StepConfig, CombinedExamples } from './types';
import * as aceEditor from './ace-editor';
import * as appState from './app-state';
import * as blueprintCompiler from './blueprint-compiler';
import * as blueprintUI from './blueprint-ui';
import { type BlueprintUIDependencies } from './blueprint-ui';
import * as customStepsModule from './custom-steps';
import * as domUtils from './dom-utils';
import * as myBlueprints from './my-blueprints';
import * as urlController from './url-controller';
import { type URLControllerDependencies } from './url-controller';
import * as wizard from './wizard';
import { type WizardDependencies } from './wizard';
import { type StepInserterDependencies } from './step-inserter';
import { toastService } from './toast-service';
import { parsePlaygroundQueryApi } from './playground-integration';
import { getDragAfterElement } from './drag-drop';
import { parseQueryParamsForBlueprint } from './query-params';
import { createStep } from './step-renderer';
import { generateLabel } from './label-generator';
import { blueprintEventBus } from './blueprint-event-bus';
import { HistoryController, type HistoryControllerDependencies } from './history-controller';
import { StepLibraryController, type StepLibraryControllerDependencies } from './step-library-controller';
import { BlueprintCompilationController, type BlueprintCompilationControllerDependencies } from './blueprint-compilation-controller';
import { PasteHandlerController, type PasteHandlerControllerDependencies } from './paste-handler-controller';
import { StateController, type StateControllerDependencies } from './state-controller';
import { EventHandlersController, type EventHandlersControllerDependencies } from './event-handlers-controller';
import { AIInstructionsController, type AIInstructionsControllerDependencies } from './ai-instructions-controller';
import { SaveDialogController } from './save-dialog-controller';
import { processSteps } from './step-utils';
import { examples } from './examples';
import { FileDropController, type FileDropControllerDependencies } from './file-drop-controller';

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

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	return ((...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => fn(...args), delay);
	}) as T;
}

addEventListener('DOMContentLoaded', function () {
	const compiler = new PlaygroundStepLibrary();
	const customSteps = compiler.getAvailableSteps() as Record<string, StepDefinition>;

	window.stepCompiler = compiler;
	const stepList = document.getElementById('step-library')!;
	const blueprintSteps = document.getElementById('blueprint-steps')!;

	// Note: appState.showCallbacks and appState.isManualEditMode are imported from app-state.ts
	// URL detection functions are imported from content-detection.ts
	// DOM utility functions (domUtils.fixMouseCursor, etc.) are imported from dom-utils.ts
	// createStep is now imported from step-renderer.ts

	// Helper functions to get/set blueprint value from Ace editor or textarea
	function getBlueprintValue(): string {
		if (aceEditor.blueprintAceEditor) {
			return aceEditor.blueprintAceEditor.getValue();
		}
		const textarea = document.getElementById('blueprint-compiled') as HTMLTextAreaElement;
		return textarea ? textarea.value : '';
	}

	function setBlueprintValue(value: string): void {
		if (aceEditor.blueprintAceEditor) {
			aceEditor.blueprintAceEditor.setValue(value, -1);
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
		showCallbacks: appState.showCallbacks
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
		myStep.date = new Date().toISOString();
		stepLibraryController.insertMyStep(myStepName, myStep);
		customStepsModule.saveMyStep(myStepName, myStep);
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
		const stepElement = step.closest('.step') as HTMLElement | null;
		if ( !stepElement ) return;

		const stepClone = stepElement.cloneNode( true ) as HTMLElement;
		stepClone.removeAttribute( 'id' );
		blueprintSteps.appendChild( stepClone );
		stepClone.classList.remove( 'dragging' );
		stepClone.classList.remove( 'hidden' );
		stepClone.querySelectorAll( 'input,textarea' ).forEach( domUtils.fixMouseCursor );
		blueprintEventBus.emit( 'blueprint:updated' );
		( stepClone.querySelector( 'input,textarea' ) as HTMLElement | null )?.focus();

		if ( window.goatcounter && stepElement.dataset.step ) {
			window.goatcounter.count( {
				path: 'step-used/' + stepElement.dataset.step,
				title: 'Step Used: ' + stepElement.dataset.step,
				event: true
			} );
		}

		// Hide the mobile step library overlay after adding a step
		const stepLibraryHolder = document.getElementById('step-library-holder');
		if (stepLibraryHolder) {
			stepLibraryHolder.classList.remove('mobile-visible');
		}
	}

	const debouncedBlueprintUpdate = debounce(() => {
		blueprintEventBus.emit('blueprint:updated');
	}, 300);

	// Use input event for debounced blueprint updates (more reliable on mobile)
	document.addEventListener('input', (event) => {
		const target = event.target as HTMLElement;
		if (!target) {
			return;
		}
		// Skip filter, blueprint-compiled, and title (title has its own handler)
		if (target.id === 'filter' || target.id === 'blueprint-compiled' || target.id === 'title') {
			return;
		}
		// Only handle inputs/textareas in blueprint-steps
		if (target.closest('#blueprint-steps') && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
			debouncedBlueprintUpdate();
		}
	});

	document.addEventListener('keyup', (event) => {
		if (event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}
		if (!(event.target instanceof Element)) {
			return;
		}
		const targetId = (event.target as HTMLElement).id;
		if (targetId === 'blueprint-compiled') {
			return;
		}
		if (targetId === 'filter') {
			if (event.key === 'Enter') {
				const stepLibrary = document.getElementById('step-library');
				if (stepLibrary && stepLibrary.querySelectorAll('.step:not(.hidden)').length === 1) {
					const step = stepLibrary.querySelector('.step:not(.hidden)');
					if (step) {
						insertStep(step);
					}
				}
			}
			return;
		}
		if (event.key === 'Escape') {
			const focusable = event.target.closest('input,textarea,.step');
			if (focusable instanceof HTMLElement) {
				focusable.blur();
			}
			return;
		}
		if (event.key === 'Enter') {
			if (event.target.closest('#save-step')) {
				saveMyStep();
				return;
			}
			if (event.target.closest('#step-library .step')) {
				insertStep(event.target);
				return;
			}
			if (event.target.closest('input') && !event.target.closest('.ace_search_form')) {
				blueprintEventBus.emit('blueprint:updated');
				const playgroundLink = document.getElementById('playground-link');
				if (playgroundLink instanceof HTMLElement) {
					playgroundLink.click();
				}
				return;
			}
		}
		if (event.target.closest('#step-library .step')) {
			if (event.key === 'ArrowDown') {
				const focused = stepList.querySelector('.step:focus');
				let nextStep = focused?.nextElementSibling;
				while (nextStep && nextStep.classList.contains('hidden')) {
					nextStep = nextStep.nextElementSibling;
				}
				if (nextStep instanceof HTMLElement) {
					nextStep.focus();
				}
				return;
			}
			if (event.key === 'ArrowUp') {
				const focused = stepList.querySelector('.step:focus');
				let prevStep = focused?.previousElementSibling;
				while (prevStep && prevStep.classList.contains('hidden')) {
					prevStep = prevStep.previousElementSibling;
				}
				if (prevStep instanceof HTMLElement) {
					prevStep.focus();
				}
				return;
			}
		}
		if (event.target.closest('input,textarea')) {
			return;
		}
		if (event.key.match(/^[a-z0-9]$/i)) {
			const filterEl = document.getElementById('filter');
			if (filterEl instanceof HTMLInputElement) {
				filterEl.value = event.key;
				filterEl.focus();
				filterEl.dispatchEvent(new Event('keyup'));
			}
			return;
		}
		if (event.key === 'ArrowUp') {
			(stepList.querySelector('.step:last-child') as HTMLElement | null)?.focus();
			return;
		}
		if (event.key === 'ArrowDown') {
			(stepList.querySelector('.step') as HTMLElement | null)?.focus();
			return;
		}
	});
	document.addEventListener( 'change', ( event ) => {
		const target = event.target as HTMLElement | null;
		if ( !target ) return;

		if ( target.id === 'mode' || target.id === 'preview-mode' || target.id === 'exclude-meta' || target.id === 'wp-version' || target.id === 'php-version' || target.id === 'encoding-format' ) {
			blueprintEventBus.emit( 'blueprint:updated' );
			return;
		}
		if ( ( target as HTMLInputElement ).name === 'blueprint-version' ) {
			transformJson();
			return;
		}
		if ( !target.closest( '#blueprint' ) ) {
			return;
		}
		if ( target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' ) {
			blueprintEventBus.emit( 'blueprint:updated' );
			return;
		}
	} );
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
	// makeParentStepDraggable, makeParentStepUnDraggable, and domUtils.fixMouseCursor are now imported from dom-utils.ts

	// Initialize Event Handlers Controller
	const eventHandlersControllerDeps: EventHandlersControllerDependencies = {
		customSteps,
		showCallbacks: appState.showCallbacks,
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

	blueprintSteps.addEventListener( 'drop', ( event ) => {
		event.preventDefault();

		const droppedStep = document.querySelector( '.dragging' );
		if ( droppedStep && droppedStep.parentNode === stepList ) {
			const stepClone = droppedStep.cloneNode( true ) as HTMLElement;
			blueprintSteps.appendChild( stepClone );
			stepClone.querySelectorAll( 'input,textarea' ).forEach( domUtils.fixMouseCursor );
			stepClone.classList.remove( 'dragging' );
		}
	} );

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
	blueprintSteps.addEventListener( 'dragleave', ( event ) => {
		const draggable = document.querySelector( '.dragging' );
		if ( !draggable || draggable.parentNode === stepList ) {
			return;
		}
		if ( event.relatedTarget === null || !blueprintSteps.contains( event.relatedTarget as Node ) ) {
			const removedBlock = document.querySelector( '.dragging' );
			if ( removedBlock ) {
				removedBlock.remove();
			}
		}
		blueprintEventBus.emit( 'blueprint:updated' );
	} );

	// detectUrlType, detectWpAdminUrl are now imported from content-detection.ts
	// Step insertion functions are now imported from step-inserter.ts

	// detectHtml, detectPhp, isPlaygroundDomain, detectPlaygroundUrl, and detectPlaygroundQueryApiUrl
	// are now imported from content-detection.ts
	// parsePlaygroundQueryApi is now imported from playground-integration.ts

	// Paste handler is now managed by paste-handler-controller.ts

	// getDragAfterElement is now imported from drag-drop.ts

	document.getElementById( 'clear' )!.addEventListener( 'click', function () {
		( document.getElementById( 'title' ) as HTMLInputElement ).value = '';
		blueprintSteps.textContent = '';
		const draghint = document.createElement( 'div' );
		draghint.id = 'draghint';
		draghint.textContent = 'Click or drag the steps to add them here.';
		blueprintSteps.appendChild( draghint );
		( document.getElementById( 'examples' ) as HTMLSelectElement ).value = 'Examples';
		blueprintEventBus.emit( 'blueprint:updated' );
	} );

	function downloadBlueprint() {
		if ( window.goatcounter ) {
			window.goatcounter.count( {
				path: 'download-blueprint',
				title: 'Download Blueprint',
				event: true
			} );
		}
		const blueprintContent = getBlueprintValue();
		let title = ( document.getElementById( 'title' ) as HTMLInputElement ).value;

		if ( !title || !title.trim() ) {
			const stepBlocks = blueprintSteps.querySelectorAll( '.step' );
			const pluginSteps = Array.from( stepBlocks ).filter( block => ( block as HTMLElement ).dataset.step === 'installPlugin' );
			const hasLandingPage = Array.from( stepBlocks ).some( block => ( block as HTMLElement ).dataset.step === 'setLandingPage' );

			if ( pluginSteps.length === 1 ) {
				const pluginSlug = ( pluginSteps[0].querySelector( '[name="pluginData"]' ) as HTMLInputElement | null )?.value ||
					( pluginSteps[0].querySelector( '[name="slug"]' ) as HTMLInputElement | null )?.value ||
					( pluginSteps[0].querySelector( '[name="url"]' ) as HTMLInputElement | null )?.value;
				if ( pluginSlug && pluginSlug.trim() ) {
					const parts = pluginSlug.split( '/' ).filter( ( p: string ) => p.trim() );
					const slug = parts[parts.length - 1].replace( /\.zip$/, '' );
					title = 'blueprint-' + slug + ( hasLandingPage ? '-landingpage' : '' );
				}
			}
		}

		if ( !title || !title.trim() ) {
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
			stateController.restoreState(blueprintCompiler.uncompressState(location.hash.replace(/^#+/, '')));
		}
	});

	// Filter and show-builtin event listeners are now handled by step-library-controller.ts

	// Handle title input changes
	document.addEventListener( 'input', function ( e ) {
		const target = e.target as HTMLElement | null;
		if ( target && target.id === 'title' ) {
			blueprintEventBus.emit( 'blueprint:updated' );
		}
	} );

	// compressState and uncompressState are now imported from blueprint-compiler.ts
	// Wrapper function to gather DOM values and call the imported compressState
	function updateVariableVisibility( stepBlock: HTMLElement ) {
		stepBlock.querySelectorAll( 'input,select,textarea,button' ).forEach( function ( input ) {
			const inputEl = input as HTMLInputElement;
			if ( !inputEl || typeof appState.showCallbacks[stepBlock.dataset.step as string] === 'undefined' || typeof appState.showCallbacks[stepBlock.dataset.step as string][inputEl.name] !== 'function' ) {
				return;
			}
			const tr = inputEl.closest( 'tr' ) as HTMLTableRowElement | null;
			if ( tr ) {
				if ( appState.showCallbacks[stepBlock.dataset.step as string][inputEl.name]( stepBlock ) ) {
					tr.style.display = '';
				} else {
					tr.style.display = 'none';
				}
			}
		} );
	}
	// getStepData is now extracted to blueprint-compiler.ts as extractStepDataFromElement
	function getStepData( stepBlock: HTMLElement ) {
		return blueprintCompiler.extractStepDataFromElement( stepBlock );
	}

	let lastCompressedState = '';

	function loadCombinedExamples() {
		const combinedExamples: CombinedExamples = {
			landingPage: '/',
			steps: []
		};
		const titleEl = document.getElementById( 'title' ) as HTMLInputElement;
		if ( titleEl.value ) {
			combinedExamples.title = titleEl.value;
		}
		const state: StepData[] = [];

		blueprintSteps.querySelectorAll( '.step' ).forEach( function ( stepBlock ) {
			updateVariableVisibility( stepBlock as HTMLElement );
			const step = getStepData( stepBlock as HTMLElement );
			state.push( step );
			combinedExamples.steps = combinedExamples.steps.concat( step );
		} );

		if ( combinedExamples.steps.length > 0 ) {
			const draghint = document.getElementById( 'draghint' );
			if ( draghint ) {
				draghint.style.display = 'none';
			}
		} else {
			const draghint = document.getElementById( 'draghint' );
			if ( draghint ) {
				draghint.style.display = '';
			}
		}

		appState.setBlueprint( JSON.stringify( combinedExamples, null, 2 ) );

		const currentCompressedState = stateController.compressStateFromDOM( state );

		// Only update history if the state has changed
		if ( currentCompressedState !== lastCompressedState ) {
			lastCompressedState = currentCompressedState;
			history.pushState( state, '', '#' + currentCompressedState );
		}

		// Always transform JSON to update playground link
		transformJson();
	}

	// Subscribe to blueprint:updated events to trigger loadCombinedExamples
	blueprintEventBus.on('blueprint:updated', () => {
		loadCombinedExamples();
		updateMenuItemVisibility();
	});

	function updateMenuItemVisibility() {
		const hasSteps = blueprintSteps.querySelectorAll('.step').length > 0;
		const copyRedirectUrlMenu = document.getElementById('copy-redirect-url-menu');
		if (copyRedirectUrlMenu) {
			copyRedirectUrlMenu.style.display = hasSteps ? '' : 'none';
		}
	}

	// Dependencies for step inserter functions
	const stepInserterDeps: StepInserterDependencies = {
		blueprintSteps,
		customSteps,
		showCallbacks: appState.showCallbacks
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
	const pageAccessedByReload = ( () => {
		try {
			const navigationEntry = performance.getEntriesByType( 'navigation' )[0] as PerformanceNavigationTiming;
			return navigationEntry && navigationEntry.type === 'reload';
		} catch ( e ) {
			// Fallback: check if document.referrer is the same as current URL
			// This catches most reload cases across browsers
			return document.referrer === window.location.href;
		}
	} )();

	const queryParamBlueprint = parseQueryParamsForBlueprint();
	if ( queryParamBlueprint ) {
		if ( queryParamBlueprint.redir ) {
			( document.getElementById( 'encoding-format' ) as HTMLSelectElement ).value = 'base64';
		}
		stateController.restoreState( { steps: queryParamBlueprint.steps } );
		// Clear step[] and url[] parameters from URL to prevent conflicts with hash state
		const newUrl = new URL( window.location.href );
		newUrl.search = '';
		history.replaceState( null, '', newUrl.pathname + newUrl.hash );
		if ( queryParamBlueprint.redir && !( document.getElementById( 'preview-mode' ) as HTMLSelectElement ).value && !pageAccessedByReload ) {
			stateController.autoredirect( queryParamBlueprint.redir );
		}
	} else if ( location.hash ) {
		stateController.restoreState( blueprintCompiler.uncompressState( location.hash.replace( /^#+/, '' ) ) );
		if ( !( document.getElementById( 'preview-mode' ) as HTMLSelectElement ).value && blueprintSteps.querySelectorAll( '.step' ).length && !pageAccessedByReload ) {
			stateController.autoredirect();
		}
	} else {
		blueprintEventBus.emit( 'blueprint:updated' );
	}
	Object.keys( examples ).forEach( function ( example ) {
		const option = document.createElement( 'option' );
		option.value = example;
		option.innerText = example;
		document.getElementById( 'examples' )!.appendChild( option );
	} );
	document.getElementById( 'examples' )!.addEventListener( 'change', function ( this: HTMLSelectElement ) {
		if ( 'Examples' === this.value ) {
			return;
		}
		( document.getElementById( 'title' ) as HTMLInputElement ).value = this.value;
		stateController.restoreState( { steps: examples[this.value] } );
		blueprintEventBus.emit( 'blueprint:updated' );
	} );
	stepLibraryController.clearFilter();

	// Wizard Mode Implementation
	// Initialize wizard with dependencies
	const wizardDeps: WizardDependencies = {
		customSteps,
		setBlueprintValue,
		createStep,
		showCallbacks: appState.showCallbacks,
		blueprintSteps
	};

	wizard.initWizard(wizardDeps);

	// Make wizard functions globally accessible
	window.removeWizardStep = wizard.removeWizardStep;
	window.removeWizardPlugin = wizard.removeWizardPlugin;
	window.removeWizardTheme = wizard.removeWizardTheme;

	// Manual Edit Mode functionality
	const blueprintTextarea = document.getElementById( 'blueprint-compiled' )!;

	blueprintTextarea.addEventListener( 'focus', function () {
		aceEditor.initBlueprintAceEditor( getBlueprintValue, appState.isManualEditMode, transformJson );
	} );

	blueprintTextarea.addEventListener( 'click', function () {
		aceEditor.initBlueprintAceEditor( getBlueprintValue, appState.isManualEditMode, transformJson );
	} );

	// Intercept playground link clicks to regenerate URL if in manual edit mode
	document.getElementById( 'playground-link' )!.addEventListener( 'click', function ( e ) {
		if ( window.goatcounter ) {
			window.goatcounter.count( {
				path: 'launch-playground',
				title: 'Launch in Playground',
				event: true
			} );
		}

		// Show save prompt only if blueprint hasn't been saved yet
		const blueprintString = getBlueprintValue();
		if ( blueprintString && blueprintString.trim() && !isBlueprintAlreadySaved() ) {
			showSavePromptToast();
		}

		if ( appState.isManualEditMode.value ) {
			e.preventDefault();
			transformJson();
			// Allow the click to proceed after transformJson updates the href
			setTimeout( () => {
				window.open( ( document.getElementById( 'playground-link' ) as HTMLAnchorElement ).href, '_blank' );
			}, 0 );
		}
	} );


	// generateRedirectUrl and dropdown functions are now imported from url-controller.ts

	// Setup dropdown close handler
	urlController.setupDropdownCloseHandler();

	const mainDropdown = document.getElementById('more-options-dropdown');
	if (mainDropdown) {
		urlController.initMoreOptionsDropdown(mainDropdown);
	}

	const moreOptionsMenu = document.getElementById( 'more-options-menu' );

	document.getElementById( 'copy-playground-url-menu' )!.addEventListener( 'click', async function ( e ) {
		const playgroundUrl = ( document.getElementById( 'playground-link' ) as HTMLAnchorElement ).href;
		const button = e.currentTarget as HTMLElement;
		const originalContent = button.cloneNode( true );
		const success = await urlController.copyToClipboard( playgroundUrl );
		if ( success ) {
			showCopiedFeedback( button, originalContent );
		}
	} );

	document.getElementById( 'download-blueprint-menu' )!.addEventListener( 'click', function () {
		if ( moreOptionsMenu ) moreOptionsMenu.style.display = 'none';
		downloadBlueprint();
	} );

	document.getElementById( 'share-url-menu' )!.addEventListener( 'click', async function ( e ) {
		if ( window.goatcounter ) {
			window.goatcounter.count( {
				path: 'share-url',
				title: 'Share URL',
				event: true
			} );
		}

		try {
			// Use redirect URL if steps exist, otherwise share current URL with hash
			const redirectUrl = urlController.generateRedirectUrl( 1, false, urlControllerDeps );
			const shareUrl = redirectUrl || window.location.href;

			const button = e.currentTarget as HTMLElement;
			const originalContent = button.cloneNode( true );
			const title = ( document.getElementById( 'title' ) as HTMLInputElement ).value || 'WordPress Playground Blueprint';

			const result = await urlController.shareUrl( shareUrl, title );

			if ( result === 'shared' || result === 'copied' ) {
				if ( result === 'copied' ) {
					showCopiedFeedback( button, originalContent );
				} else if ( moreOptionsMenu ) {
					moreOptionsMenu.style.display = 'none';
				}
			}
		} catch ( err ) {
			console.error( 'Error in share-url handler:', err );
		}
	} );

	// copyToClipboard is now imported from url-controller.ts

	function showCopiedFeedback( button: HTMLElement, originalContent: Node ) {
		button.textContent = '✓ Copied!';
		setTimeout( () => {
			button.textContent = '';
			while ( originalContent.firstChild ) {
				button.appendChild( originalContent.firstChild );
			}
			if ( moreOptionsMenu ) {
				moreOptionsMenu.style.display = 'none';
			}
		}, 1500 );
	}

	document.getElementById( 'copy-redirect-url-menu' )!.addEventListener( 'click', async function ( e ) {
		if ( window.goatcounter ) {
			window.goatcounter.count( {
				path: 'copy-redirect-url',
				title: 'Copy Redirect URL',
				event: true
			} );
		}

		try {
			const redirectUrl = urlController.generateRedirectUrl( 1, true, urlControllerDeps );

			if ( !redirectUrl ) {
				console.error( 'No steps found' );
				return;
			}

			const button = e.currentTarget as HTMLElement;
			const originalContent = button.cloneNode( true );
			const success = await urlController.copyToClipboard( redirectUrl );
			if ( success ) {
				showCopiedFeedback( button, originalContent );
			}
		} catch ( err ) {
			console.error( 'Error in copy-redirect-url handler:', err );
		}
	} );

	// AI Instructions Controller
	const aiInstructionsControllerDeps: AIInstructionsControllerDependencies = {
		blueprintSteps,
		customSteps,
		moreOptionsMenu
	};
	new AIInstructionsController(aiInstructionsControllerDeps);

	// History functionality is now handled by history-controller.ts
	// Save dialog needs to be created after historyController is initialized
	let historyController: HistoryController;
	let saveDialogController: SaveDialogController;

	function showSaveBlueprintDialog( defaultName: string, isOverwrite: boolean ) {
		saveDialogController.show( defaultName, isOverwrite );
	}

	// showToast and showMyBlueprintsToast are now provided by toast-service.ts
	const showToast = (message: string) => toastService.showGlobal(message);
	const showMyBlueprintsToast = (message: string, undoCallback?: () => void) => toastService.showInBlueprintsDialog(message, undoCallback);

	// File drop controller for blueprint and wp-env.json imports
	const fileDropControllerDeps: FileDropControllerDependencies = {
		restoreSteps,
		showToast: showMyBlueprintsToast
	};
	new FileDropController( fileDropControllerDeps );

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

		const history = myBlueprints.getHistory();
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

		const history = myBlueprints.getHistory();
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

		toastService.showGlobalWithAction(message, actionLabel, () => {
			if (existingEntry) {
				const updatedHistory = history.filter(entry => entry.title !== blueprintTitle);
				myBlueprints.saveHistory(updatedHistory);
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

	function captureCurrentSteps(): StepConfig {
		const stepsData: StepConfig = {
			steps: []
		};

		document.querySelectorAll( '#blueprint-steps .step' ).forEach( function ( stepBlock ) {
			const stepData = getStepData( stepBlock as HTMLElement );
			if ( stepData ) {
				stepsData.steps.push( stepData );
			}
		} );

		const options = {
			wpVersion: ( document.getElementById( 'wp-version' ) as HTMLSelectElement ).value,
			phpVersion: ( document.getElementById( 'php-version' ) as HTMLSelectElement ).value,
			phpExtensionBundles: ( document.getElementById( 'phpExtensionBundles' ) as HTMLInputElement | null )?.checked || false,
			mode: ( document.getElementById( 'mode' ) as HTMLSelectElement ).value,
			storage: ( document.getElementById( 'storage' ) as HTMLSelectElement ).value,
			autosave: ( document.getElementById( 'autosave' ) as HTMLSelectElement ).value,
			playground: ( document.getElementById( 'playground' ) as HTMLSelectElement ).value,
			encodingFormat: ( document.getElementById( 'encoding-format' ) as HTMLSelectElement ).value,
			previewMode: ( document.getElementById( 'preview-mode' ) as HTMLSelectElement ).value
		};

		const defaults: typeof options = {
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

		const isAllDefaults = ( Object.keys( options ) as Array<keyof typeof options> ).every( function ( key ) {
			return options[key] === defaults[key];
		} );

		if ( !isAllDefaults ) {
			stepsData.options = options;
		}

		const titleInput = document.getElementById( 'title' ) as HTMLInputElement;
		if ( titleInput && titleInput.value ) {
			stepsData.title = titleInput.value;
		}

		return stepsData;
	}

	// generateLabel is now imported from label-generator.ts

	function formatDate( isoString: string ) {
		const date = new Date( isoString );
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor( diffMs / 60000 );
		const diffHours = Math.floor( diffMs / 3600000 );
		const diffDays = Math.floor( diffMs / 86400000 );

		if ( diffMins < 1 ) {
			return 'Just now';
		}
		if ( diffMins < 60 ) {
			return diffMins + ' minute' + ( diffMins !== 1 ? 's' : '' ) + ' ago';
		}
		if ( diffHours < 24 ) {
			return diffHours + ' hour' + ( diffHours !== 1 ? 's' : '' ) + ' ago';
		}
		if ( diffDays < 7 ) {
			return diffDays + ' day' + ( diffDays !== 1 ? 's' : '' ) + ' ago';
		}
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	// Save to History button
	document.getElementById( 'save-to-history-btn' )!.addEventListener( 'click', function () {
		historyController.saveToHistoryWithName();
	} );


	// Toast close button
	document.getElementById( 'global-toast-close' )!.addEventListener( 'click', function () {
		hideSavePromptToast();
	} );

	// Undo toast close button
	document.getElementById( 'blueprints-dialog-toast-close' )!.addEventListener( 'click', function () {
		const toast = document.getElementById( 'blueprints-dialog-toast' );
		if ( toast ) toast.style.display = 'none';
		// Timeout is managed by toast-service.ts
	} );


	function appendSteps( stepsData: StepConfig ) {
		if ( !stepsData || !stepsData.steps ) {
			return;
		}

		const draghint = document.getElementById( 'draghint' );
		if ( draghint ) {
			draghint.remove();
		}

		const container = document.getElementById( 'blueprint-steps' )!;
		const missingSteps = processSteps( stepsData.steps, container );

		if ( missingSteps.length > 0 ) {
			toastService.showGlobal( 'Warning: ' + missingSteps.length + ' step(s) not found: ' + missingSteps.join( ', ' ) );
		}
	}

	function restoreSteps( stepsData: StepConfig, title: string ) {
		if ( !stepsData || !stepsData.steps ) {
			return;
		}

		appState.isManualEditMode.value = false;
		const manualEditBanner = document.getElementById( 'manual-edit-banner' );
		if ( manualEditBanner ) {
			manualEditBanner.style.display = 'none';
		}

		const blueprintStepsContainer = document.getElementById( 'blueprint-steps' )!;
		blueprintStepsContainer.textContent = '';
		const draghint = document.createElement( 'div' );
		draghint.id = 'draghint';
		draghint.textContent = 'Click or drag the steps to add them here.';
		blueprintStepsContainer.appendChild( draghint );

		if ( title ) {
			( document.getElementById( 'title' ) as HTMLInputElement ).value = title;
		}

		const missingSteps = processSteps( stepsData.steps, blueprintStepsContainer );

		if ( missingSteps.length > 0 ) {
			showMyBlueprintsToast( 'Warning: ' + missingSteps.length + ' step(s) not found: ' + missingSteps.join( ', ' ) );
		}

		if ( stepsData.options ) {
			const opts = stepsData.options;
			if ( opts.wpVersion ) {
				( document.getElementById( 'wp-version' ) as HTMLSelectElement ).value = opts.wpVersion;
			}
			if ( opts.phpVersion ) {
				( document.getElementById( 'php-version' ) as HTMLSelectElement ).value = opts.phpVersion;
			}
			if ( opts.phpExtensionBundles !== undefined ) {
				( document.getElementById( 'phpExtensionBundles' ) as HTMLInputElement ).checked = opts.phpExtensionBundles;
			}
			if ( opts.mode ) {
				( document.getElementById( 'mode' ) as HTMLSelectElement ).value = opts.mode;
			}
			if ( opts.storage ) {
				( document.getElementById( 'storage' ) as HTMLSelectElement ).value = opts.storage;
			}
			if ( opts.autosave ) {
				( document.getElementById( 'autosave' ) as HTMLSelectElement ).value = opts.autosave;
			}
			if ( opts.playground ) {
				( document.getElementById( 'playground' ) as HTMLSelectElement ).value = opts.playground;
			}
			if ( opts.encodingFormat ) {
				( document.getElementById( 'encoding-format' ) as HTMLSelectElement ).value = opts.encodingFormat;
			} else if ( opts.base64 !== undefined ) {
				( document.getElementById( 'encoding-format' ) as HTMLSelectElement ).value = opts.base64 ? 'base64' : 'auto';
			}
			if ( opts.previewMode ) {
				( document.getElementById( 'preview-mode' ) as HTMLSelectElement ).value = opts.previewMode;
			}
		}

		blueprintEventBus.emit( 'blueprint:updated' );
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

	// Initialize Save Dialog Controller (must be after historyController)
	saveDialogController = new SaveDialogController( { historyController } );

	// Initialize Paste Handler Controller
	const pasteHandlerControllerDeps: PasteHandlerControllerDependencies = {
		stepInserterDeps,
		restoreSteps,
		appendSteps
	};
	const pasteHandlerController = new PasteHandlerController(pasteHandlerControllerDeps);

	// History controller methods are now accessed directly via the historyController instance

	// Initialize empty blueprint if no steps are present
	if (blueprintSteps.querySelectorAll('.step').length === 0) {
		setBlueprintValue(JSON.stringify({}, null, 2));
	}
});
