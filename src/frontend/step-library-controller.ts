/**
 * Step Library Controller
 * Manages the step library UI, filtering, and My Steps functionality
 */

import { StepDefinition, ShowCallbacks } from './types';
import { createStep } from './step-renderer';
import { fixMouseCursor } from './dom-utils';
import { getMySteps } from './custom-steps';
import { STEP_CATEGORIES, STEP_CATEGORY_MAP } from '../step-categories';

export interface StepLibraryControllerDependencies {
	stepList: HTMLElement;
	customSteps: Record<string, StepDefinition>;
	showCallbacks: ShowCallbacks;
}

export class StepLibraryController {
	private deps: StepLibraryControllerDependencies;
	private categoryContainers: Map<string, HTMLElement> = new Map();

	constructor(deps: StepLibraryControllerDependencies) {
		this.deps = deps;
		this.setupEventListeners();
	}

	/**
	 * Initialize the step library with all available steps
	 */
	initializeStepLibrary(): void {
		// Create "My Steps" category (initially hidden, shown when steps exist)
		const myStepsDetails = this.createCategoryElement('my-steps', 'My Steps');
		myStepsDetails.classList.add('hidden');
		this.deps.stepList.appendChild(myStepsDetails);

		// Create category containers
		for (const category of STEP_CATEGORIES) {
			const details = this.createCategoryElement(category.id, category.label);
			this.deps.stepList.appendChild(details);
		}

		// Create "Other" category for uncategorized steps
		const otherDetails = this.createCategoryElement('other', 'Other');
		this.deps.stepList.appendChild(otherDetails);

		// Populate step library with all custom steps
		for (const name in this.deps.customSteps) {
			const data = this.deps.customSteps[name];

			// Skip deprecated or hidden steps
			if ( data.deprecated || data.hidden ) {
				continue;
			}

			data.step = name;
			const step = createStep(name, data, this.deps.showCallbacks);
			step.querySelectorAll('input,textarea').forEach(fixMouseCursor);

			const categoryId = STEP_CATEGORY_MAP[name] || 'other';
			const container = this.categoryContainers.get(categoryId);
			if (container) {
				container.appendChild(step);
			}
		}

		// Load custom steps from localStorage
		const mySteps = getMySteps();
		for (const name in mySteps) {
			const data = mySteps[name];
			this.insertMyStep(name, data);
		}

		// Hide empty categories
		this.updateCategoryVisibility();
	}

	/**
	 * Create a collapsible category element
	 */
	private createCategoryElement(id: string, label: string): HTMLDetailsElement {
		const details = document.createElement('details');
		details.className = 'step-category';
		details.dataset.categoryId = id;
		details.open = true;

		const summary = document.createElement('summary');
		summary.className = 'step-category-header';
		summary.textContent = label;
		details.appendChild(summary);

		const stepsContainer = document.createElement('div');
		stepsContainer.className = 'step-category-steps';
		details.appendChild(stepsContainer);

		this.categoryContainers.set(id, stepsContainer);

		return details;
	}

	/**
	 * Insert a custom "My Step" into the step library
	 */
	insertMyStep(name: string, data: StepDefinition): void {
		data.mine = true;

		const myStepsContainer = this.categoryContainers.get('my-steps');
		if (!myStepsContainer) return;

		// Show the "My Steps" category
		const myStepsDetails = myStepsContainer.closest('.step-category') as HTMLElement;
		if (myStepsDetails) {
			myStepsDetails.classList.remove('hidden');
		}

		// Find the correct alphabetical position within "My Steps"
		let beforeStep: Element | null = null;
		for (const child of Array.from(myStepsContainer.children)) {
			const childElement = child as HTMLElement;
			if (childElement.dataset && childElement.dataset.id && childElement.dataset.id > name) {
				beforeStep = child;
				break;
			}
		}

		const step = createStep(name, data, this.deps.showCallbacks);
		myStepsContainer.insertBefore(step, beforeStep);
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

		// Hide categories where all steps are hidden
		this.updateCategoryVisibilityAfterFilter();
	}

	/**
	 * Update category visibility after filtering
	 */
	private updateCategoryVisibilityAfterFilter(): void {
		this.deps.stepList.querySelectorAll('.step-category').forEach((details) => {
			const stepsContainer = details.querySelector('.step-category-steps');
			if (!stepsContainer) return;

			const allSteps = stepsContainer.querySelectorAll('.step');
			const visibleSteps = stepsContainer.querySelectorAll('.step:not(.hidden)');

			if (allSteps.length === 0 || visibleSteps.length === 0) {
				(details as HTMLElement).classList.add('hidden');
			} else {
				(details as HTMLElement).classList.remove('hidden');
			}
		});
	}

	/**
	 * Hide categories that have no steps
	 */
	private updateCategoryVisibility(): void {
		this.deps.stepList.querySelectorAll('.step-category').forEach((details) => {
			const stepsContainer = details.querySelector('.step-category-steps');
			if (!stepsContainer) return;

			const categoryId = (details as HTMLElement).dataset.categoryId;
			// Don't hide "My Steps" here — it's managed separately
			if (categoryId === 'my-steps') return;

			if (stepsContainer.children.length === 0) {
				(details as HTMLElement).classList.add('hidden');
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

			// Show all categories (except empty ones)
			this.deps.stepList.querySelectorAll('.step-category').forEach((details) => {
				const stepsContainer = details.querySelector('.step-category-steps');
				if (stepsContainer && stepsContainer.children.length > 0) {
					(details as HTMLElement).classList.remove('hidden');
				}
			});
		}
	}
}
