/**
 * Wizard Module
 *
 * Handles wizard-mode UI for building WordPress Playground blueprints interactively.
 * Uses the Shared State Module Pattern as documented in REFACTORING_PLAN.md.
 */

import { StepDefinition, WizardState } from './types';
import { showCallbacks } from './app-state';
import { createStep } from './step-renderer';
import { blueprintEventBus } from './blueprint-event-bus';

export interface WizardDependencies {
	customSteps: Record<string, StepDefinition>;
	setBlueprintValue: (value: string) => void;
	createStep?: (name: string, data: StepDefinition, showCallbacks: any) => HTMLElement;
	showCallbacks?: any;
	blueprintSteps?: HTMLElement;
}

let wizardDeps: WizardDependencies | null = null;

const wizardState: WizardState = {
	currentStep: 1,
	totalSteps: 4,
	selectedSteps: [],
	selectedPlugins: [],
	selectedThemes: [],
	projectTitle: '',
	projectDescription: '',
	stepConfigurations: {}
};

const step2SelectedSteps: string[] = [];

const stepCategories = {
	'Content': ['addPage', 'addPost', 'importContent', 'importWxr', 'importWordPressFiles'],
	'Plugins': ['installPlugin', 'githubPluginRelease', 'installPluginZip'],
	'Themes': ['installTheme', 'githubThemeRelease'],
	'Users': ['createUser', 'login'],
	'Settings': ['setSiteName', 'setLandingPage', 'updateOption', 'runPhp'],
	'Advanced': ['addFilter', 'cp', 'mkdir', 'mv', 'rm', 'rmdir', 'runWpInstallationWizard', 'writeFile']
};

export function getWizardState(): WizardState {
	return { ...wizardState };
}

export function initWizard(dependencies?: WizardDependencies): void {
	if (dependencies) {
		wizardDeps = dependencies;
	}

	setupWizardEventListeners();
	populateWizardStepCards();
}

function populateWizardStepCards(): void {
	if (!wizardDeps) return;

	const step2Container = document.getElementById('wizard-step-2-grid');
	if (!step2Container) return;

	step2Container.innerHTML = '';

	Object.entries(stepCategories).forEach(([category, steps]) => {
		steps.forEach(stepName => {
			const stepData = wizardDeps!.customSteps[stepName];
			if (!stepData) return;

			const card = document.createElement('div');
			card.className = 'wizard-step-card';
			card.dataset.step = stepName;
			card.dataset.wizardStep = '2';

			const title = document.createElement('h4');
			title.textContent = stepData.name || stepName;
			card.appendChild(title);

			if (stepData.description) {
				const description = document.createElement('p');
				description.textContent = stepData.description;
				card.appendChild(description);
			}

			const categoryTag = document.createElement('span');
			categoryTag.className = 'wizard-category-tag';
			categoryTag.textContent = category;
			card.appendChild(categoryTag);

			card.addEventListener('click', () => {
				toggleWizardStepSelection(stepName, 2, card);
			});

			step2Container.appendChild(card);
		});
	});
}

function toggleWizardStepSelection(stepName: string, wizardStep: number, card: HTMLElement): void {
	const isSelected = card.classList.contains('selected');

	if (isSelected) {
		card.classList.remove('selected');
		if (wizardStep === 1) {
			wizardState.selectedSteps = wizardState.selectedSteps.filter(s => s !== stepName);
			updateWizardSelectedList();
		} else if (wizardStep === 2) {
			const index = step2SelectedSteps.indexOf(stepName);
			if (index > -1) {
				step2SelectedSteps.splice(index, 1);
			}
			updateWizardSelectedList2();
		}
		delete wizardState.stepConfigurations[stepName];
	} else {
		card.classList.add('selected');
		if (wizardStep === 1) {
			if (!wizardState.selectedSteps.includes(stepName)) {
				wizardState.selectedSteps.push(stepName);
			}
			updateWizardSelectedList();
		} else if (wizardStep === 2) {
			if (!step2SelectedSteps.includes(stepName)) {
				step2SelectedSteps.push(stepName);
			}
			updateWizardSelectedList2();
		}
	}
}

export function addWizardPlugin(): void {
	const input = document.getElementById('plugin-url-input') as HTMLInputElement;
	if (!input) return;

	const url = input.value.trim();
	if (!url) return;

	if (!wizardState.selectedPlugins.includes(url)) {
		wizardState.selectedPlugins.push(url);
		updateWizardPluginList();
	}

	input.value = '';
}

export function addWizardTheme(): void {
	const input = document.getElementById('theme-url-input') as HTMLInputElement;
	if (!input) return;

	const url = input.value.trim();
	if (!url) return;

	if (!wizardState.selectedThemes.includes(url)) {
		wizardState.selectedThemes.push(url);
		updateWizardThemeList();
	}

	input.value = '';
}

export function removeWizardPlugin(index: number): void {
	wizardState.selectedPlugins.splice(index, 1);
	updateWizardPluginList();
}

export function removeWizardTheme(index: number): void {
	wizardState.selectedThemes.splice(index, 1);
	updateWizardThemeList();
}

export function updateWizardPluginList(): void {
	const container = document.getElementById('wizard-selected-plugins');
	if (!container) return;

	container.innerHTML = '';

	if (wizardState.selectedPlugins.length === 0) {
		const emptyMsg = document.createElement('p');
		emptyMsg.style.color = 'var(--text-muted)';
		emptyMsg.style.fontStyle = 'italic';
		emptyMsg.textContent = 'No plugins added yet';
		container.appendChild(emptyMsg);
		return;
	}

	wizardState.selectedPlugins.forEach((pluginUrl, index) => {
		const item = document.createElement('div');
		item.className = 'wizard-selected-item';

		const urlSpan = document.createElement('span');
		urlSpan.textContent = pluginUrl;
		item.appendChild(urlSpan);

		const removeBtn = document.createElement('span');
		removeBtn.className = 'remove';
		removeBtn.textContent = '×';
		removeBtn.onclick = () => removeWizardPlugin(index);
		item.appendChild(removeBtn);

		container.appendChild(item);
	});
}

export function updateWizardThemeList(): void {
	const container = document.getElementById('wizard-selected-themes');
	if (!container) return;

	container.innerHTML = '';

	if (wizardState.selectedThemes.length === 0) {
		const emptyMsg = document.createElement('p');
		emptyMsg.style.color = 'var(--text-muted)';
		emptyMsg.style.fontStyle = 'italic';
		emptyMsg.textContent = 'No themes added yet';
		container.appendChild(emptyMsg);
		return;
	}

	wizardState.selectedThemes.forEach((themeUrl, index) => {
		const item = document.createElement('div');
		item.className = 'wizard-selected-item';

		const urlSpan = document.createElement('span');
		urlSpan.textContent = themeUrl;
		item.appendChild(urlSpan);

		const removeBtn = document.createElement('span');
		removeBtn.className = 'remove';
		removeBtn.textContent = '×';
		removeBtn.onclick = () => removeWizardTheme(index);
		item.appendChild(removeBtn);

		container.appendChild(item);
	});
}

function updateWizardSelectedList(): void {
	const container = document.getElementById('wizard-selected-list');
	if (!container) return;

	container.innerHTML = '';

	if (wizardState.selectedSteps.length === 0) {
		const emptyMsg = document.createElement('p');
		emptyMsg.style.color = 'var(--text-muted)';
		emptyMsg.style.fontStyle = 'italic';
		emptyMsg.textContent = 'No steps selected';
		container.appendChild(emptyMsg);
		return;
	}

	if (!wizardDeps) return;

	wizardState.selectedSteps.forEach(stepName => {
		const item = document.createElement('div');
		item.className = 'wizard-selected-item';

		const stepData = wizardDeps!.customSteps[stepName];
		const name = stepData?.name || stepName;

		const nameSpan = document.createElement('span');
		nameSpan.textContent = name;
		item.appendChild(nameSpan);

		const removeBtn = document.createElement('span');
		removeBtn.className = 'remove';
		removeBtn.textContent = '×';
		removeBtn.onclick = () => {
			(window as any).removeWizardStep(stepName, 1);
		};
		item.appendChild(removeBtn);

		container.appendChild(item);
	});
}

function updateWizardSelectedList2(): void {
	const container = document.getElementById('wizard-selected-list-2');
	if (!container) return;

	container.innerHTML = '';

	if (step2SelectedSteps.length === 0) {
		const emptyMsg = document.createElement('p');
		emptyMsg.style.color = 'var(--text-muted)';
		emptyMsg.style.fontStyle = 'italic';
		emptyMsg.textContent = 'No additional features selected';
		container.appendChild(emptyMsg);
		return;
	}

	if (!wizardDeps) return;

	step2SelectedSteps.forEach(stepName => {
		const item = document.createElement('div');
		item.className = 'wizard-selected-item';

		const stepData = wizardDeps!.customSteps[stepName];
		const name = stepData?.name || stepName;

		const nameSpan = document.createElement('span');
		nameSpan.textContent = name;
		item.appendChild(nameSpan);

		const removeBtn = document.createElement('span');
		removeBtn.className = 'remove';
		removeBtn.textContent = '×';
		removeBtn.onclick = () => {
			(window as any).removeWizardStep(stepName, 2);
		};
		item.appendChild(removeBtn);

		container.appendChild(item);
	});
}

export function removeWizardStep(stepName: string, wizardStep: number): void {
	if (wizardStep === 1) {
		wizardState.selectedSteps = wizardState.selectedSteps.filter(s => s !== stepName);
		updateWizardSelectedList();
	} else if (wizardStep === 2) {
		const index = step2SelectedSteps.indexOf(stepName);
		if (index > -1) {
			step2SelectedSteps.splice(index, 1);
		}
		updateWizardSelectedList2();
	}

	delete wizardState.stepConfigurations[stepName];

	const card = document.querySelector(`[data-step="${stepName}"][data-wizard-step="${wizardStep}"]`);
	if (card) {
		card.classList.remove('selected');
	}
}

function goToWizardStep(stepNumber: number): void {
	const currentStepEl = document.getElementById(`wizard-step-${wizardState.currentStep}`);
	if (currentStepEl) {
		currentStepEl.style.display = 'none';
	}

	wizardState.currentStep = stepNumber;

	const newStepEl = document.getElementById(`wizard-step-${wizardState.currentStep}`);
	if (newStepEl) {
		newStepEl.style.display = 'block';
	}

	updateWizardProgress();
	updateWizardNavigation();

	if (stepNumber === 3) {
		generateStepConfigurations();
	} else if (stepNumber === 4) {
		generateWizardSummary();
	}
}

function updateWizardProgress(): void {
	document.querySelectorAll('.wizard-step-indicator').forEach((indicator, index) => {
		const stepNum = index + 1;
		indicator.classList.remove('active', 'completed');

		if (stepNum < wizardState.currentStep) {
			indicator.classList.add('completed');
		} else if (stepNum === wizardState.currentStep) {
			indicator.classList.add('active');
		}
	});

	const currentStepDisplay = document.getElementById('wizard-current-step');
	if (currentStepDisplay) {
		currentStepDisplay.textContent = wizardState.currentStep.toString();
	}
}

function updateWizardNavigation(): void {
	const prevBtn = document.getElementById('wizard-prev') as HTMLButtonElement;
	const nextBtn = document.getElementById('wizard-next') as HTMLButtonElement;
	const finishBtn = document.getElementById('wizard-finish') as HTMLButtonElement;

	if (prevBtn) {
		prevBtn.disabled = wizardState.currentStep === 1;
	}

	if (wizardState.currentStep === wizardState.totalSteps) {
		if (nextBtn) nextBtn.style.display = 'none';
		if (finishBtn) finishBtn.style.display = 'inline-flex';
	} else {
		if (nextBtn) nextBtn.style.display = 'inline-flex';
		if (finishBtn) finishBtn.style.display = 'none';
	}
}

function generateStepConfigurations(): void {
	const container = document.getElementById('wizard-configuration-area');
	if (!container || !wizardDeps) return;

	container.innerHTML = '';

	const allSelectedSteps = [...wizardState.selectedSteps, ...step2SelectedSteps];

	if (allSelectedSteps.length === 0) {
		const emptyMsg = document.createElement('p');
		emptyMsg.style.color = 'var(--text-muted)';
		emptyMsg.style.fontStyle = 'italic';
		emptyMsg.textContent = 'No items to configure. All set!';
		container.appendChild(emptyMsg);
		return;
	}

	allSelectedSteps.forEach(stepName => {
		const stepData = wizardDeps!.customSteps[stepName];
		if (!stepData || !stepData.vars) return;

		const configCard = document.createElement('div');
		configCard.className = 'wizard-config-step';

		const title = document.createElement('h4');
		title.textContent = stepData.description || stepName;
		configCard.appendChild(title);

		const form = document.createElement('div');
		form.className = 'wizard-form-group';

		const varsArray = Array.isArray(stepData.vars)
			? stepData.vars
			: Object.entries(stepData.vars).map(([name, config]) => ({ name, ...config as any }));

		varsArray.forEach(varConfig => {
			const varName = varConfig.name;
			const formGroup = document.createElement('div');
			formGroup.className = 'wizard-form-group';

			const label = document.createElement('label');
			label.textContent = varConfig.description || varConfig.label || varName;
			formGroup.appendChild(label);

			let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

			if (varConfig.type === 'textarea') {
				input = document.createElement('textarea');
			} else if (varConfig.type === 'select') {
				input = document.createElement('select');
				if (varConfig.options) {
					varConfig.options.forEach((option: string) => {
						const optElement = document.createElement('option');
						optElement.value = option;
						optElement.textContent = option;
						input.appendChild(optElement);
					});
				}
			} else {
				input = document.createElement('input');
				input.type = varConfig.type || 'text';
			}

			input.name = varName;
			if ('placeholder' in input) {
				input.placeholder = varConfig.placeholder || '';
			}
			if ('value' in input) {
				input.value = varConfig.default || '';
			}

			if (varConfig.description) {
				const description = document.createElement('small');
				description.textContent = varConfig.description;
				formGroup.appendChild(description);
			}

			formGroup.appendChild(input);
			form.appendChild(formGroup);

			if (!wizardState.stepConfigurations[stepName]) {
				wizardState.stepConfigurations[stepName] = {};
			}
			const inputValue = ('value' in input) ? input.value : '';
			wizardState.stepConfigurations[stepName][varName] = inputValue;

			input.addEventListener('input', () => {
				const updatedValue = ('value' in input) ? input.value : '';
				wizardState.stepConfigurations[stepName][varName] = updatedValue;
			});
		});

		configCard.appendChild(form);
		container.appendChild(configCard);
	});
}

function generateWizardSummary(): void {
	const summarySection = document.getElementById('wizard-summary-all');
	if (!summarySection || !wizardDeps) return;

	summarySection.innerHTML = '';

	if (wizardState.selectedPlugins.length > 0) {
		const pluginsHeader = document.createElement('p');
		const strong = document.createElement('strong');
		strong.textContent = 'Plugins:';
		pluginsHeader.appendChild(strong);
		summarySection.appendChild(pluginsHeader);

		const pluginsList = document.createElement('ul');
		wizardState.selectedPlugins.forEach(pluginUrl => {
			const li = document.createElement('li');
			const code = document.createElement('code');
			code.textContent = pluginUrl;
			li.appendChild(code);
			pluginsList.appendChild(li);
		});
		summarySection.appendChild(pluginsList);
	}

	if (wizardState.selectedThemes.length > 0) {
		const themesHeader = document.createElement('p');
		const strong = document.createElement('strong');
		strong.textContent = 'Themes:';
		themesHeader.appendChild(strong);
		summarySection.appendChild(themesHeader);

		const themesList = document.createElement('ul');
		wizardState.selectedThemes.forEach(themeUrl => {
			const li = document.createElement('li');
			const code = document.createElement('code');
			code.textContent = themeUrl;
			li.appendChild(code);
			themesList.appendChild(li);
		});
		summarySection.appendChild(themesList);
	}

	if (step2SelectedSteps.length > 0) {
		const featuresHeader = document.createElement('p');
		const strong = document.createElement('strong');
		strong.textContent = 'Additional Features:';
		featuresHeader.appendChild(strong);
		summarySection.appendChild(featuresHeader);

		const featuresList = document.createElement('ul');
		step2SelectedSteps.forEach(stepName => {
			const stepData = wizardDeps!.customSteps[stepName];
			const li = document.createElement('li');
			li.textContent = stepData?.name || stepName;
			featuresList.appendChild(li);
		});
		summarySection.appendChild(featuresList);
	}

	if (wizardState.selectedPlugins.length === 0 &&
		wizardState.selectedThemes.length === 0 &&
		step2SelectedSteps.length === 0) {
		const emptyMsg = document.createElement('p');
		emptyMsg.style.color = 'var(--text-muted)';
		emptyMsg.style.fontStyle = 'italic';
		emptyMsg.textContent = 'A basic WordPress installation with no additional plugins or features.';
		summarySection.appendChild(emptyMsg);
	}

	const finalBlueprint = generateFinalBlueprint();
	const blueprintDisplay = document.getElementById('wizard-final-blueprint') as HTMLTextAreaElement;
	if (blueprintDisplay) {
		blueprintDisplay.value = JSON.stringify(finalBlueprint, null, 2);
	}
}

function generateFinalBlueprint(): any {
	const blueprint: any = {
		landingPage: '/wp-admin/',
		steps: []
	};

	if (wizardState.projectTitle) {
		blueprint.meta = {
			title: wizardState.projectTitle
		};
		if (wizardState.projectDescription) {
			blueprint.meta.description = wizardState.projectDescription;
		}
	}

	wizardState.selectedPlugins.forEach(pluginUrl => {
		blueprint.steps.push({
			step: 'installPlugin',
			vars: {
				url: pluginUrl
			}
		});
	});

	wizardState.selectedThemes.forEach(themeUrl => {
		blueprint.steps.push({
			step: 'installTheme',
			vars: {
				url: themeUrl
			}
		});
	});

	step2SelectedSteps.forEach(stepName => {
		const stepConfig: any = {
			step: stepName
		};

		if (wizardState.stepConfigurations[stepName]) {
			const vars: Record<string, any> = {};
			Object.keys(wizardState.stepConfigurations[stepName]).forEach(varName => {
				const value = wizardState.stepConfigurations[stepName][varName];
				if (value !== '' && value !== null && value !== undefined) {
					vars[varName] = value;
				}
			});

			if (Object.keys(vars).length > 0) {
				stepConfig.vars = vars;
			}
		}

		blueprint.steps.push(stepConfig);
	});

	return blueprint;
}

function setupWizardEventListeners(): void {
	const wizardToggle = document.getElementById('wizard-mode-toggle');
	if (wizardToggle) {
		wizardToggle.addEventListener('click', () => {
			const wizardContainer = document.getElementById('wizard-container');
			if (wizardContainer) {
				wizardContainer.style.display = 'flex';
				document.body.style.overflow = 'hidden';

				setTimeout(() => {
					const pluginInput = document.getElementById('plugin-url-input') as HTMLInputElement;
					if (pluginInput) {
						pluginInput.focus();
					}
				}, 100);
			}
		});
	}

	const wizardContainer = document.getElementById('wizard-container');
	if (wizardContainer) {
		wizardContainer.addEventListener('submit', (e) => {
			e.preventDefault();
			e.stopPropagation();
		});

		wizardContainer.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
				e.preventDefault();
				e.stopPropagation();

				const target = e.target as HTMLInputElement;
				if (target.id === 'plugin-url-input') {
					addWizardPlugin();
				} else if (target.id === 'theme-url-input') {
					addWizardTheme();
				}
			}
		});
	}

	const wizardClose = document.getElementById('wizard-close');
	if (wizardClose) {
		wizardClose.addEventListener('click', () => {
			applyWizardToMainInterface();

			const wizardContainer = document.getElementById('wizard-container');
			if (wizardContainer) {
				wizardContainer.style.display = 'none';
			}
			document.body.style.overflow = '';
		});
	}

	const wizardPrev = document.getElementById('wizard-prev');
	if (wizardPrev) {
		wizardPrev.addEventListener('click', () => {
			if (wizardState.currentStep > 1) {
				goToWizardStep(wizardState.currentStep - 1);
			}
		});
	}

	const wizardNext = document.getElementById('wizard-next');
	if (wizardNext) {
		wizardNext.addEventListener('click', () => {
			if (validateWizardStep()) {
				if (wizardState.currentStep < wizardState.totalSteps) {
					goToWizardStep(wizardState.currentStep + 1);
				}
			}
		});
	}

	const wizardFinish = document.getElementById('wizard-finish');
	if (wizardFinish) {
		wizardFinish.addEventListener('click', () => {
			finishWizard();
		});
	}

	const wizardProgress = document.getElementById('wizard-progress');
	if (wizardProgress) {
		wizardProgress.addEventListener('click', (e) => {
			const indicator = (e.target as HTMLElement).closest('.wizard-step-indicator');
			if (indicator) {
				const targetStep = parseInt((indicator as HTMLElement).dataset.step || '1', 10);
				if (targetStep <= wizardState.currentStep || targetStep === wizardState.currentStep + 1) {
					goToWizardStep(targetStep);
				}
			}
		});
	}

	const addPluginBtn = document.getElementById('add-plugin-btn');
	if (addPluginBtn) {
		addPluginBtn.addEventListener('click', addWizardPlugin);
	}

	const addThemeBtn = document.getElementById('add-theme-btn');
	if (addThemeBtn) {
		addThemeBtn.addEventListener('click', addWizardTheme);
	}

	['plugin-url-input', 'theme-url-input'].forEach(inputId => {
		const input = document.getElementById(inputId) as HTMLInputElement;
		if (!input) return;

		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				e.stopImmediatePropagation();
				return false;
			}
		});

		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				e.stopImmediatePropagation();
				return false;
			}
		});

		input.addEventListener('keyup', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				e.stopImmediatePropagation();
				if (inputId === 'plugin-url-input') {
					addWizardPlugin();
				} else if (inputId === 'theme-url-input') {
					addWizardTheme();
				}
				return false;
			}
		});
	});

	const wizardTitle = document.getElementById('wizard-title') as HTMLInputElement;
	if (wizardTitle) {
		wizardTitle.addEventListener('input', (e) => {
			wizardState.projectTitle = (e.target as HTMLInputElement).value;
		});
	}
}

function validateWizardStep(): boolean {
	return true;
}

function applyWizardToMainInterface(): void {
	if (!wizardDeps) return;

	const finalBlueprint = generateFinalBlueprint();

	const titleInput = document.getElementById('title') as HTMLInputElement;
	if (titleInput) {
		titleInput.value = wizardState.projectTitle || '';
	}

	const blueprintSteps = document.getElementById('blueprint-steps');
	if (blueprintSteps) {
		const draghint = document.createElement('div');
		draghint.id = 'draghint';
		draghint.textContent = 'Click or drag the steps to add them here.';
		blueprintSteps.innerHTML = '';
		blueprintSteps.appendChild(draghint);

		finalBlueprint.steps.forEach((stepConfig: any) => {
			if (wizardDeps!.customSteps[stepConfig.step]) {
				const stepData = wizardDeps!.customSteps[stepConfig.step];
				const stepElement = createStep(
					stepData.name || stepConfig.step,
					stepData,
					showCallbacks
				);

				if (stepConfig.vars) {
					Object.keys(stepConfig.vars).forEach(varName => {
						const input = stepElement.querySelector(`[name="${varName}"]`) as HTMLInputElement;
						if (input) {
							if (input.type === 'checkbox') {
								input.checked = stepConfig.vars[varName];
							} else {
								input.value = stepConfig.vars[varName];
							}
						}
					});
				}

				blueprintSteps.appendChild(stepElement);
			}
		});
	}

	wizardDeps.setBlueprintValue(JSON.stringify(finalBlueprint, null, '\t'));

	// Emit blueprint:updated event instead of calling loadCombinedExamples directly
	blueprintEventBus.emit('blueprint:updated');
}

export function finishWizard(): void {
	applyWizardToMainInterface();

	const wizardContainer = document.getElementById('wizard-container');
	if (wizardContainer) {
		wizardContainer.style.display = 'none';
	}
	document.body.style.overflow = '';

	resetWizardState();
}

export function resetWizardState(): void {
	wizardState.currentStep = 1;
	wizardState.selectedSteps = [];
	wizardState.selectedPlugins = [];
	wizardState.selectedThemes = [];
	step2SelectedSteps.length = 0;
	wizardState.projectTitle = '';
	wizardState.projectDescription = '';
	wizardState.stepConfigurations = {};

	const wizardTitle = document.getElementById('wizard-title') as HTMLInputElement;
	if (wizardTitle) wizardTitle.value = '';

	const pluginInput = document.getElementById('plugin-url-input') as HTMLInputElement;
	if (pluginInput) pluginInput.value = '';

	const themeInput = document.getElementById('theme-url-input') as HTMLInputElement;
	if (themeInput) themeInput.value = '';

	document.querySelectorAll('.wizard-step-card').forEach(card => {
		card.classList.remove('selected');
	});

	updateWizardPluginList();
	updateWizardThemeList();
	updateWizardSelectedList2();
	updateWizardProgress();
	updateWizardNavigation();

	document.querySelectorAll('.wizard-step').forEach((step, index) => {
		(step as HTMLElement).style.display = index === 0 ? 'block' : 'none';
	});
}
