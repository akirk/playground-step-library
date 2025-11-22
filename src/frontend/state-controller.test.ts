import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StateController, type StateControllerDependencies } from './state-controller';
import { blueprintEventBus } from './blueprint-event-bus';

describe('StateController', () => {
	let controller: StateController;
	let blueprintSteps: HTMLElement;
	let stepList: HTMLElement;
	let mockElements: Record<string, HTMLElement>;

	beforeEach(() => {
		// Create DOM elements
		blueprintSteps = document.createElement('div');
		blueprintSteps.id = 'blueprint-steps';
		document.body.appendChild(blueprintSteps);

		stepList = document.createElement('div');
		stepList.id = 'step-library';
		document.body.appendChild(stepList);

		// Create form elements for compressStateFromDOM
		mockElements = {
			title: createInputElement('title', 'text', 'My Blueprint'),
			autosave: createInputElement('autosave', 'text', '10'),
			playground: createInputElement('playground', 'text', 'playground.wordpress.net'),
			mode: createSelectElement('mode', 'browser-full-screen'),
			previewMode: createInputElement('preview-mode', 'text', ''),
			excludeMeta: createCheckboxElement('exclude-meta', false)
		};

		Object.values(mockElements).forEach(el => document.body.appendChild(el));

		// Initialize controller
		const deps: StateControllerDependencies = {
			blueprintSteps,
			stepList
		};
		controller = new StateController(deps);
	});

	afterEach(() => {
		// Safely clear DOM
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild);
		}
	});

	describe('compressStateFromDOM', () => {
		it('should compress state with title', () => {
			(mockElements.title as HTMLInputElement).value = 'Test Blueprint';
			const steps = [{ step: 'login', username: 'admin' }];

			const result = controller.compressStateFromDOM(steps);
			expect(result).toBeTruthy();
			expect(typeof result).toBe('string');
		});

		it('should compress state with autosave', () => {
			(mockElements.autosave as HTMLInputElement).value = '5';
			const steps = [{ step: 'login' }];

			const result = controller.compressStateFromDOM(steps);
			expect(result).toBeTruthy();
		});

		it('should compress state with playground URL', () => {
			(mockElements.playground as HTMLInputElement).value = 'custom.playground.net';
			const steps = [{ step: 'login' }];

			const result = controller.compressStateFromDOM(steps);
			expect(result).toBeTruthy();
		});

		it('should compress state with mode', () => {
			(mockElements.mode as HTMLSelectElement).value = 'seamless';
			const steps = [{ step: 'login' }];

			const result = controller.compressStateFromDOM(steps);
			expect(result).toBeTruthy();
		});

		it('should compress state with previewMode', () => {
			(mockElements.previewMode as HTMLInputElement).value = 'mobile';
			const steps = [{ step: 'login' }];

			const result = controller.compressStateFromDOM(steps);
			expect(result).toBeTruthy();
		});

		it('should compress state with excludeMeta', () => {
			(mockElements.excludeMeta as HTMLInputElement).checked = true;
			const steps = [{ step: 'login' }];

			const result = controller.compressStateFromDOM(steps);
			expect(result).toBeTruthy();
		});

		it('should handle missing form elements gracefully', () => {
			// Clear DOM safely
			while (document.body.firstChild) {
				document.body.removeChild(document.body.firstChild);
			}
			blueprintSteps = document.createElement('div');
			document.body.appendChild(blueprintSteps);

			const steps = [{ step: 'login' }];
			const result = controller.compressStateFromDOM(steps);
			expect(result).toBeTruthy();
		});

		it('should return empty string for empty steps with no options', () => {
			// Clear all form values
			(mockElements.title as HTMLInputElement).value = '';
			(mockElements.autosave as HTMLInputElement).value = '';
			(mockElements.playground as HTMLInputElement).value = '';
			(mockElements.previewMode as HTMLInputElement).value = '';
			(mockElements.excludeMeta as HTMLInputElement).checked = false;

			const result = controller.compressStateFromDOM([]);
			expect(result).toBe('');
		});
	});

	describe('restoreState', () => {
		let emitSpy: any;

		beforeEach(() => {
			emitSpy = vi.spyOn(blueprintEventBus, 'emit');
		});

		afterEach(() => {
			emitSpy.mockRestore();
		});

		it('should handle null state', () => {
			controller.restoreState(null);
			expect(blueprintSteps.children.length).toBe(0);
		});

		it('should handle undefined state', () => {
			controller.restoreState(undefined);
			expect(blueprintSteps.children.length).toBe(0);
		});

		it('should restore title', () => {
			const state = {
				steps: [],
				title: 'Restored Blueprint'
			};

			controller.restoreState(state);
			expect((mockElements.title as HTMLInputElement).value).toBe('Restored Blueprint');
		});

		it('should restore autosave', () => {
			const state = {
				steps: [],
				autosave: '15'
			};

			controller.restoreState(state);
			expect((mockElements.autosave as HTMLInputElement).value).toBe('15');
		});

		it('should restore playground URL', () => {
			const state = {
				steps: [],
				playground: 'custom.test'
			};

			controller.restoreState(state);
			expect((mockElements.playground as HTMLInputElement).value).toBe('custom.test');
		});

		it('should restore mode', () => {
			// Add seamless option to select
			const seamlessOption = document.createElement('option');
			seamlessOption.value = 'seamless';
			(mockElements.mode as HTMLSelectElement).appendChild(seamlessOption);

			const state = {
				steps: [],
				mode: 'seamless'
			};

			controller.restoreState(state);
			expect((mockElements.mode as HTMLSelectElement).value).toBe('seamless');
		});

		it('should restore previewMode', () => {
			const state = {
				steps: [],
				previewMode: 'tablet'
			};

			controller.restoreState(state);
			expect((mockElements.previewMode as HTMLInputElement).value).toBe('tablet');
		});

		it('should restore excludeMeta', () => {
			const state = {
				steps: [],
				excludeMeta: true
			};

			controller.restoreState(state);
			expect((mockElements.excludeMeta as HTMLInputElement).checked).toBe(true);
		});

		it('should not restore excludeMeta if undefined', () => {
			(mockElements.excludeMeta as HTMLInputElement).checked = false;
			const state = {
				steps: []
			};

			controller.restoreState(state);
			expect((mockElements.excludeMeta as HTMLInputElement).checked).toBe(false);
		});

		it('should handle state without steps', () => {
			const state = {
				steps: []
			};

			controller.restoreState(state);
			expect(blueprintSteps.children.length).toBe(0);
			expect(emitSpy).not.toHaveBeenCalled();
		});

		it('should restore single step', () => {
			// Add step to library
			const libraryStep = document.createElement('div');
			libraryStep.className = 'step';
			libraryStep.dataset.step = 'login';
			stepList.appendChild(libraryStep);

			const state = {
				steps: [
					{ step: 'login', username: 'admin' }
				]
			};

			controller.restoreState(state);
			expect(blueprintSteps.children.length).toBe(1);
			expect(emitSpy).toHaveBeenCalledWith('blueprint:updated');
		});

		it('should restore multiple steps', () => {
			// Add steps to library
			const step1 = document.createElement('div');
			step1.className = 'step';
			step1.dataset.step = 'login';
			stepList.appendChild(step1);

			const step2 = document.createElement('div');
			step2.className = 'step';
			step2.dataset.step = 'installPlugin';
			stepList.appendChild(step2);

			const state = {
				steps: [
					{ step: 'login' },
					{ step: 'installPlugin' }
				]
			};

			controller.restoreState(state);
			expect(blueprintSteps.children.length).toBe(2);
		});

		it('should restore step with count', () => {
			const libraryStep = document.createElement('div');
			libraryStep.className = 'step';
			libraryStep.dataset.step = 'installPlugin';

			const countInput = document.createElement('input');
			countInput.name = 'count';
			countInput.value = '1';
			libraryStep.appendChild(countInput);

			stepList.appendChild(libraryStep);

			const state = {
				steps: [
					{ step: 'installPlugin', count: 5 }
				]
			};

			controller.restoreState(state);
			const restoredStep = blueprintSteps.children[0];
			const restoredCount = restoredStep.querySelector('[name="count"]') as HTMLInputElement;
			expect(restoredCount.value).toBe('5');
		});

		it('should restore text input values', () => {
			const libraryStep = document.createElement('div');
			libraryStep.className = 'step';
			libraryStep.dataset.step = 'login';

			const usernameInput = document.createElement('input');
			usernameInput.name = 'username';
			usernameInput.value = '';
			libraryStep.appendChild(usernameInput);

			stepList.appendChild(libraryStep);

			const state = {
				steps: [
					{ step: 'login', username: 'testuser' }
				]
			};

			controller.restoreState(state);
			const restoredStep = blueprintSteps.children[0];
			const restoredInput = restoredStep.querySelector('[name="username"]') as HTMLInputElement;
			expect(restoredInput.value).toBe('testuser');
		});

		it('should restore checkbox values', () => {
			const libraryStep = document.createElement('div');
			libraryStep.className = 'step';
			libraryStep.dataset.step = 'installPlugin';

			const activateCheckbox = document.createElement('input');
			activateCheckbox.type = 'checkbox';
			activateCheckbox.name = 'activate';
			activateCheckbox.checked = false;
			libraryStep.appendChild(activateCheckbox);

			stepList.appendChild(libraryStep);

			const state = {
				steps: [
					{ step: 'installPlugin', activate: 'true' }
				]
			};

			controller.restoreState(state);
			const restoredStep = blueprintSteps.children[0];
			const restoredCheckbox = restoredStep.querySelector('[name="activate"]') as HTMLInputElement;
			expect(restoredCheckbox.checked).toBe(true);
		});

		it('should restore checkbox as false for "false" string', () => {
			const libraryStep = document.createElement('div');
			libraryStep.className = 'step';
			libraryStep.dataset.step = 'installPlugin';

			const activateCheckbox = document.createElement('input');
			activateCheckbox.type = 'checkbox';
			activateCheckbox.name = 'activate';
			activateCheckbox.checked = true;
			libraryStep.appendChild(activateCheckbox);

			stepList.appendChild(libraryStep);

			const state = {
				steps: [
					{ step: 'installPlugin', activate: 'false' }
				]
			};

			controller.restoreState(state);
			const restoredStep = blueprintSteps.children[0];
			const restoredCheckbox = restoredStep.querySelector('[name="activate"]') as HTMLInputElement;
			expect(restoredCheckbox.checked).toBe(false);
		});

		it('should skip step without matching definition', () => {
			const state = {
				steps: [
					{ step: 'nonexistent' }
				]
			};

			controller.restoreState(state);
			expect(blueprintSteps.children.length).toBe(0);
		});

		it('should warn about missing variables', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const libraryStep = document.createElement('div');
			libraryStep.className = 'step';
			libraryStep.dataset.step = 'login';
			stepList.appendChild(libraryStep);

			const state = {
				steps: [
					{ step: 'login', nonexistent: 'value' }
				]
			};

			controller.restoreState(state);
			expect(consoleWarnSpy).toHaveBeenCalled();
			consoleWarnSpy.mockRestore();
		});
	});

	describe('autoredirect', () => {
		let dialog: HTMLDialogElement;
		let playgroundLink: HTMLAnchorElement;
		let autoredirectTitle: HTMLElement;
		let autoredirectSeconds: HTMLElement;
		let cancelButton: HTMLButtonElement;
		let redirectNowButton: HTMLButtonElement;

		beforeEach(() => {
			vi.useFakeTimers();

			// Create dialog elements
			dialog = document.createElement('dialog');
			dialog.id = 'autoredirecting';

			autoredirectTitle = document.createElement('span');
			autoredirectTitle.id = 'autoredirect-title';
			dialog.appendChild(autoredirectTitle);

			autoredirectSeconds = document.createElement('span');
			autoredirectSeconds.id = 'autoredirecting-seconds';
			dialog.appendChild(autoredirectSeconds);

			cancelButton = document.createElement('button');
			cancelButton.id = 'autoredirect-cancel';
			dialog.appendChild(cancelButton);

			redirectNowButton = document.createElement('button');
			redirectNowButton.id = 'redirect-now';
			dialog.appendChild(redirectNowButton);

			document.body.appendChild(dialog);

			playgroundLink = document.createElement('a');
			playgroundLink.id = 'playground-link';
			playgroundLink.href = 'https://playground.wordpress.net/';
			document.body.appendChild(playgroundLink);

			(mockElements.title as HTMLInputElement).value = 'Test Blueprint';
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should show dialog', () => {
			const showModalSpy = vi.spyOn(dialog, 'showModal');
			controller.autoredirect(5);
			expect(showModalSpy).toHaveBeenCalled();
		});

		it('should set title in dialog', () => {
			(mockElements.title as HTMLInputElement).value = 'My Test';
			controller.autoredirect(5);
			expect(autoredirectTitle.textContent).toBe('My Test');
		});

		it('should show initial countdown', () => {
			controller.autoredirect(5);
			expect(autoredirectSeconds.innerText).toBe('5 seconds');
		});

		it('should show singular for 1 second', () => {
			controller.autoredirect(1);
			expect(autoredirectSeconds.innerText).toBe('1 second');
		});

		it('should update countdown every second', () => {
			controller.autoredirect(3);
			expect(autoredirectSeconds.innerText).toBe('3 seconds');

			vi.advanceTimersByTime(1000);
			expect(autoredirectSeconds.innerText).toBe('2 seconds');

			vi.advanceTimersByTime(1000);
			expect(autoredirectSeconds.innerText).toBe('1 second');
		});

		it('should cancel on button click', () => {
			const closeSpy = vi.spyOn(dialog, 'close');
			controller.autoredirect(5);

			cancelButton.click();
			expect(closeSpy).toHaveBeenCalled();
		});

		it('should close dialog on backdrop click', () => {
			const closeSpy = vi.spyOn(dialog, 'close');
			controller.autoredirect(5);

			const event = new MouseEvent('click', { bubbles: true });
			Object.defineProperty(event, 'target', { value: dialog });
			dialog.dispatchEvent(event);

			expect(closeSpy).toHaveBeenCalled();
		});
	});
});

// Helper functions
function createInputElement(id: string, type: string, value: string): HTMLInputElement {
	const input = document.createElement('input');
	input.id = id;
	input.type = type;
	input.value = value;
	return input;
}

function createSelectElement(id: string, value: string): HTMLSelectElement {
	const select = document.createElement('select');
	select.id = id;
	const option = document.createElement('option');
	option.value = value;
	option.selected = true;
	select.appendChild(option);
	return select;
}

function createCheckboxElement(id: string, checked: boolean): HTMLInputElement {
	const checkbox = document.createElement('input');
	checkbox.id = id;
	checkbox.type = 'checkbox';
	checkbox.checked = checked;
	return checkbox;
}
