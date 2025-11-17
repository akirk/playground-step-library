/**
 * Wizard Module
 * Handles the step-by-step wizard interface for creating blueprints
 */

import { StepDefinition } from './types';

export interface WizardState {
	currentStep: number;
	totalSteps: number;
	selectedSteps: string[];
	selectedPlugins: string[];
	selectedThemes: string[];
	projectTitle: string;
	projectDescription: string;
	stepConfigurations: Record<string, any>;
}

export interface WizardDependencies {
	customSteps: Record<string, StepDefinition>;
	setBlueprintValue: (value: string) => void;
}

const stepCategories = {
	plugin: ['installPlugin'],
	theme: ['installTheme'],
	content: ['uploadFile', 'writeFile', 'cp', 'mkdir', 'importWxr', 'unzipFile'],
	config: ['defineWpConfigConsts', 'createUser', 'enableMultisite', 'setLandingPage', 'setSiteOptions'],
	advanced: ['runPHP', 'runSQL', 'runShell', 'addFilter', 'importFriendFeeds']
};

let wizardState: WizardState = {
	currentStep: 1,
	totalSteps: 4,
	selectedSteps: [],
	selectedPlugins: [],
	selectedThemes: [],
	projectTitle: '',
	projectDescription: '',
	stepConfigurations: {}
};

let step2SelectedSteps: string[] = [];
let deps: WizardDependencies;

export function initWizard(dependencies: WizardDependencies): void {
	deps = dependencies;
	populateWizardSteps();
	updateWizardProgress();
	setupWizardEventListeners();
}

export function getWizardState(): WizardState {
	return wizardState;
}

function populateWizardSteps(): void {
	// Step 1 now uses URL inputs, so we only populate Step 2
	// Populate Step 2: Content, Config, Advanced
	(['content', 'config', 'advanced'] as const).forEach(category => {
		const container = document.getElementById(`wizard-${category}-steps`);
		if (!container) return;

		stepCategories[category].forEach(stepName => {
			if (deps.customSteps[stepName]) {
				const card = createWizardStepCard(stepName, deps.customSteps[stepName], 2);
				container.appendChild(card);
			}
		});
	});

	// Initialize plugin and theme lists
	updateWizardPluginList();
	updateWizardThemeList();
}

function createWizardStepCard(stepName: string, stepData: StepDefinition, wizardStep: number): HTMLDivElement {
	const card = document.createElement('div');
	card.className = 'wizard-step-card';
	card.dataset.step = stepName;
	card.dataset.wizardStep = String(wizardStep);

	const title = document.createElement('h4');
	title.textContent = stepData.name || stepName;
	card.appendChild(title);

	if (stepData.description) {
		const description = document.createElement('p');
		description.textContent = stepData.description;
		card.appendChild(description);
	}

	card.addEventListener('click', () => toggleWizardStep(stepName, card, wizardStep));

	return card;
}

function toggleWizardStep(stepName: string, card: HTMLElement, wizardStep: number): void {
	if (wizardStep === 1) {
		const isSelected = wizardState.selectedSteps.includes(stepName);
		if (isSelected) {
			wizardState.selectedSteps = wizardState.selectedSteps.filter(s => s !== stepName);
			card.classList.remove('selected');
			delete wizardState.stepConfigurations[stepName];
		} else {
			wizardState.selectedSteps.push(stepName);
			card.classList.add('selected');
		}
		updateWizardSelectedList();
	} else if (wizardStep === 2) {
		const isSelected = step2SelectedSteps.includes(stepName);
		if (isSelected) {
			step2SelectedSteps.splice(step2SelectedSteps.indexOf(stepName), 1);
			card.classList.remove('selected');
			delete wizardState.stepConfigurations[stepName];
		} else {
			step2SelectedSteps.push(stepName);
			card.classList.add('selected');
		}
		updateWizardSelectedList2();
	}
}

export function updateWizardPluginList(): void {
	const container = document.getElementById('wizard-selected-plugins');
	if (!container) return;

	container.textContent = '';

	if (wizardState.selectedPlugins.length === 0) {
		const emptyState = document.createElement('div');
		emptyState.className = 'empty-state';
		emptyState.textContent = 'No plugins added yet';
		container.appendChild(emptyState);
		return;
	}

	wizardState.selectedPlugins.forEach((pluginUrl, index) => {
		const item = document.createElement('div');
		item.className = 'wizard-url-item';

		const urlText = document.createElement('span');
		urlText.className = 'url-text';
		urlText.textContent = pluginUrl;
		item.appendChild(urlText);

		const removeBtn = document.createElement('span');
		removeBtn.className = 'remove';
		removeBtn.textContent = '×';
		removeBtn.onclick = () => window.removeWizardPlugin(index);
		item.appendChild(removeBtn);

		container.appendChild(item);
	});
}

export function updateWizardThemeList(): void {
	const container = document.getElementById('wizard-selected-themes');
	if (!container) return;

	container.textContent = '';

	if (wizardState.selectedThemes.length === 0) {
		const emptyState = document.createElement('div');
		emptyState.className = 'empty-state';
		emptyState.textContent = 'No themes added yet';
		container.appendChild(emptyState);
		return;
	}

	wizardState.selectedThemes.forEach((themeUrl, index) => {
		const item = document.createElement('div');
		item.className = 'wizard-url-item';

		const urlText = document.createElement('span');
		urlText.className = 'url-text';
		urlText.textContent = themeUrl;
		item.appendChild(urlText);

		const removeBtn = document.createElement('span');
		removeBtn.className = 'remove';
		removeBtn.textContent = '×';
		removeBtn.onclick = () => window.removeWizardTheme(index);
		item.appendChild(removeBtn);

		container.appendChild(item);
	});
}

export function addWizardPlugin(): void {
	const input = document.getElementById('plugin-url-input') as HTMLInputElement;
	if (!input) return;

	const url = input.value.trim();

	if (url && !wizardState.selectedPlugins.includes(url)) {
		wizardState.selectedPlugins.push(url);
		input.value = '';
		updateWizardPluginList();
	}
}

export function addWizardTheme(): void {
	const input = document.getElementById('theme-url-input') as HTMLInputElement;
	if (!input) return;

	const url = input.value.trim();

	if (url && !wizardState.selectedThemes.includes(url)) {
		wizardState.selectedThemes.push(url);
		input.value = '';
		updateWizardThemeList();
	}
}

export function removeWizardPlugin(index: number): void {
	wizardState.selectedPlugins.splice(index, 1);
	updateWizardPluginList();
}

export function removeWizardTheme(index: number): void {
	wizardState.selectedThemes.splice(index, 1);
	updateWizardThemeList();
}

function updateWizardSelectedList(): void {
	const container = document.getElementById('wizard-selected-list');
	if (!container) return;

	container.textContent = '';

	if (wizardState.selectedSteps.length === 0) {
		const emptyState = document.createElement('div');
		emptyState.className = 'empty-state';
		emptyState.textContent = 'No steps selected yet';
		container.appendChild(emptyState);
		return;
	}

	wizardState.selectedSteps.forEach(stepName => {
		const item = document.createElement('div');
		item.className = 'wizard-selected-item';
		item.textContent = deps.customSteps[stepName]?.name || stepName;
		container.appendChild(item);
	});
}

function updateWizardSelectedList2(): void {
	const container = document.getElementById('wizard-selected-list-2');
	if (!container) return;

	container.textContent = '';

	if (step2SelectedSteps.length === 0) {
		const emptyState = document.createElement('div');
		emptyState.className = 'empty-state';
		emptyState.textContent = 'No steps selected yet';
		container.appendChild(emptyState);
		return;
	}

	step2SelectedSteps.forEach(stepName => {
		const item = document.createElement('div');
		item.className = 'wizard-selected-item';
		item.textContent = deps.customSteps[stepName]?.name || stepName;
		container.appendChild(item);
	});
}

function updateWizardProgress(): void {
	const progressBar = document.getElementById('wizard-progress-bar');
	const stepIndicators = document.querySelectorAll('.wizard-step-indicator');

	if (progressBar instanceof HTMLElement) {
		const progress = ((wizardState.currentStep - 1) / (wizardState.totalSteps - 1)) * 100;
		progressBar.style.width = `${progress}%`;
	}

	stepIndicators.forEach((indicator, index) => {
		if (index < wizardState.currentStep) {
			indicator.classList.add('completed');
			indicator.classList.remove('active');
		} else if (index === wizardState.currentStep - 1) {
			indicator.classList.add('active');
			indicator.classList.remove('completed');
		} else {
			indicator.classList.remove('active', 'completed');
		}
	});
}

function setupWizardEventListeners(): void {
	// Wizard step navigation
	document.getElementById('wizard-next')?.addEventListener('click', () => {
		if (wizardState.currentStep < wizardState.totalSteps) {
			wizardState.currentStep++;
			updateWizardProgress();
			updateWizardStepVisibility();
		}
	});

	document.getElementById('wizard-prev')?.addEventListener('click', () => {
		if (wizardState.currentStep > 1) {
			wizardState.currentStep--;
			updateWizardProgress();
			updateWizardStepVisibility();
		}
	});

	// Add plugin/theme buttons
	document.getElementById('add-plugin-btn')?.addEventListener('click', addWizardPlugin);
	document.getElementById('add-theme-btn')?.addEventListener('click', addWizardTheme);

	// Enter key support for inputs
	document.getElementById('plugin-url-input')?.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addWizardPlugin();
		}
	});

	document.getElementById('theme-url-input')?.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addWizardTheme();
		}
	});
}

function updateWizardStepVisibility(): void {
	const steps = document.querySelectorAll('.wizard-step');
	steps.forEach((step, index) => {
		if (index === wizardState.currentStep - 1) {
			(step as HTMLElement).style.display = 'block';
		} else {
			(step as HTMLElement).style.display = 'none';
		}
	});

	// Update buttons
	const prevBtn = document.getElementById('wizard-prev');
	const nextBtn = document.getElementById('wizard-next');

	if (prevBtn) {
		prevBtn.style.display = wizardState.currentStep === 1 ? 'none' : 'inline-block';
	}

	if (nextBtn) {
		nextBtn.textContent = wizardState.currentStep === wizardState.totalSteps ? 'Finish' : 'Next';
	}
}
