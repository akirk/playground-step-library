/**
 * Step Library Controller
 * Manages the step library UI, filtering, and My Steps functionality
 */

import { StepDefinition, ShowCallbacks } from './types';
import { createStep } from './step-renderer';
import { fixMouseCursor } from './dom-utils';
import { getMySteps } from './custom-steps';

export interface StepLibraryControllerDependencies {
	stepList: HTMLElement;
	customSteps: Record<string, StepDefinition>;
	showCallbacks: ShowCallbacks;
}

export class StepLibraryController {
	private deps: StepLibraryControllerDependencies;

	constructor(deps: StepLibraryControllerDependencies) {
		this.deps = deps;
		this.setupEventListeners();
	}

	/**
	 * Initialize the step library with all available steps
	 */
	initializeStepLibrary(): void {
		// Populate step library with all custom steps
		for (const name in this.deps.customSteps) {
			const data = this.deps.customSteps[name];

			// Skip deprecated or hidden steps
			if ( data.deprecated || data.hidden ) {
				continue;
			}

			data.step = name;
			const step = createStep(name, data, this.deps.showCallbacks);
			this.deps.stepList.appendChild(step);
			step.querySelectorAll('input,textarea').forEach(fixMouseCursor);
		}

		// Load custom steps from localStorage
		const mySteps = getMySteps();
		for (const name in mySteps) {
			const data = mySteps[name];
			this.insertMyStep(name, data);
		}
	}

	/**
	 * Insert a custom "My Step" into the step library
	 */
	insertMyStep(name: string, data: StepDefinition): void {
		data.mine = true;
		let beforeStep: Element | null = null;

		for (const j in this.deps.stepList.children) {
			const child = this.deps.stepList.children[j] as HTMLElement;
			if (child.dataset && child.dataset.id && child.dataset.id > name) {
				beforeStep = child;
				break;
			}
			if (child.classList && !child.classList.contains('mine')) {
				beforeStep = this.deps.stepList.querySelector('.step.builtin');
				break;
			}
		}

		const step = createStep(name, data, this.deps.showCallbacks);
		this.deps.stepList.insertBefore(step, beforeStep);
		step.querySelectorAll('input,textarea').forEach(fixMouseCursor);
	}

	/**
	 * Setup event listeners for step library UI
	 */
	private setupEventListeners(): void {
		// Filter input - use 'input' event for better mobile support
		const filterInput = document.getElementById('filter') as HTMLInputElement;
		if (filterInput) {
			filterInput.addEventListener('input', () => {
				this.handleFilterInput();
			});
			filterInput.addEventListener('keydown', (event) => {
				this.handleFilterKeydown(event);
			});
		}

		// Show builtin checkbox
		const showBuiltinCheckbox = document.getElementById('show-builtin') as HTMLInputElement;
		if (showBuiltinCheckbox) {
			showBuiltinCheckbox.addEventListener('change', () => {
				this.handleShowBuiltinChange();
			});

			// Set initial state
			if (showBuiltinCheckbox.checked) {
				this.deps.stepList.classList.add('show-builtin');
			} else {
				this.deps.stepList.classList.remove('show-builtin');
			}
		}
	}

	/**
	 * Handle filter input event
	 */
	private handleFilterInput(): void {
		const filterInput = document.getElementById('filter') as HTMLInputElement;

		// Convert to a fuzzy search term by allowing any character to be followed by any number of any characters
		const filter = new RegExp(filterInput.value.replace(/(.)/g, '$1.*'), 'i');

		this.deps.stepList.querySelectorAll('.step').forEach((step) => {
			const stepElement = step as HTMLElement;
			if (stepElement.dataset.id?.toLowerCase().match(filter)) {
				stepElement.classList.remove('hidden');
			} else {
				stepElement.classList.add('hidden');
			}
		});
	}

	/**
	 * Handle filter keydown for navigation
	 */
	private handleFilterKeydown(event: KeyboardEvent): void {
		if (event.key === 'ArrowDown') {
			const steps = this.deps.stepList.querySelectorAll('.step');
			for (let i = 0; i < steps.length; i++) {
				const step = steps[i] as HTMLElement;
				if (!step.classList.contains('hidden')) {
					step.focus();
					break;
				}
			}
			event.preventDefault();
		}
	}

	/**
	 * Handle show builtin checkbox change
	 */
	private handleShowBuiltinChange(): void {
		const showBuiltinCheckbox = document.getElementById('show-builtin') as HTMLInputElement;

		if (showBuiltinCheckbox.checked) {
			this.deps.stepList.classList.add('show-builtin');
		} else {
			this.deps.stepList.classList.remove('show-builtin');
		}
	}

	/**
	 * Clear the filter input
	 */
	clearFilter(): void {
		const filterInput = document.getElementById('filter') as HTMLInputElement;
		if (filterInput) {
			filterInput.value = '';

			// Show all steps
			this.deps.stepList.querySelectorAll('.step').forEach((step) => {
				step.classList.remove('hidden');
			});
		}
	}
}
