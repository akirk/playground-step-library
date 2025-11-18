/**
 * Step Inserter
 * Functions for inserting steps into the blueprint with dependency injection
 */

import { StepDefinition, ShowCallbacks } from './types';
import { createStep } from './step-renderer';
import { fixMouseCursor } from './dom-utils';
import { detectUrlType } from './content-detection';
import { shouldUseMuPlugin } from './playground-integration';
import { blueprintEventBus } from './blueprint-event-bus';

export interface StepInserterDependencies {
	blueprintSteps: HTMLElement;
	customSteps: Record<string, StepDefinition>;
	showCallbacks: ShowCallbacks;
}

/**
 * Remove the drag hint element if it exists
 */
function removeDragHint(container: HTMLElement): void {
	const draghint = container.querySelector('#draghint');
	if (draghint) {
		draghint.remove();
	}
}

/**
 * Add a step from a plugin or theme URL
 */
export function addStepFromUrl(
	url: string,
	deps: StepInserterDependencies
): boolean {
	const urlType = detectUrlType(url);
	if (!urlType) {
		return false;
	}

	const stepType = urlType === 'theme' ? 'installTheme' : 'installPlugin';
	const stepData = deps.customSteps[stepType];

	if (!stepData) {
		return false;
	}

	removeDragHint(deps.blueprintSteps);

	const stepElement = createStep(stepType, stepData, deps.showCallbacks);
	deps.blueprintSteps.appendChild(stepElement);
	stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

	const urlInput = stepElement.querySelector('input[name="url"]');
	if (urlInput instanceof HTMLInputElement) {
		urlInput.value = url;
	}

	blueprintEventBus.emit('blueprint:updated');
	return true;
}

/**
 * Add a landing page step
 */
export function addLandingPageStep(
	landingPath: string,
	deps: StepInserterDependencies
): boolean {
	const stepData = deps.customSteps['setLandingPage'];

	if (!stepData) {
		return false;
	}

	removeDragHint(deps.blueprintSteps);

	const stepElement = createStep('setLandingPage', stepData, deps.showCallbacks);
	deps.blueprintSteps.appendChild(stepElement);
	stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

	const landingPageInput = stepElement.querySelector('input[name="landingPage"]');
	if (landingPageInput instanceof HTMLInputElement) {
		landingPageInput.value = landingPath;
	}

	blueprintEventBus.emit('blueprint:updated');
	return true;
}

/**
 * Add a post step from HTML content
 */
export function addPostStepFromHtml(
	html: string,
	deps: StepInserterDependencies
): boolean {
	const stepData = deps.customSteps['addPost'];

	if (!stepData) {
		return false;
	}

	removeDragHint(deps.blueprintSteps);

	const stepElement = createStep('addPost', stepData, deps.showCallbacks);
	deps.blueprintSteps.appendChild(stepElement);
	stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

	const contentInput = stepElement.querySelector('textarea[name="content"]');
	if (contentInput instanceof HTMLTextAreaElement) {
		contentInput.value = html;
	}

	const titleInput = stepElement.querySelector('input[name="title"]');
	if (titleInput instanceof HTMLInputElement && !titleInput.value) {
		titleInput.value = 'Pasted Content';
	}

	const typeInput = stepElement.querySelector('input[name="type"]');
	if (typeInput instanceof HTMLInputElement && !typeInput.value) {
		typeInput.value = 'page';
	}

	blueprintEventBus.emit('blueprint:updated');
	return true;
}

/**
 * Add a step from PHP code
 */
export function addStepFromPhp(
	phpCode: string,
	deps: StepInserterDependencies
): boolean {
	const useMuPlugin = shouldUseMuPlugin(phpCode);
	const stepType = useMuPlugin ? 'muPlugin' : 'runPHP';
	const stepData = deps.customSteps[stepType];

	if (!stepData) {
		return false;
	}

	removeDragHint(deps.blueprintSteps);

	const stepElement = createStep(stepType, stepData, deps.showCallbacks);
	deps.blueprintSteps.appendChild(stepElement);
	stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

	const codeInput = stepElement.querySelector('textarea[name="code"]');
	if (codeInput instanceof HTMLTextAreaElement) {
		codeInput.value = phpCode;
	}

	if (useMuPlugin) {
		const nameInput = stepElement.querySelector('input[name="name"]');
		if (nameInput instanceof HTMLInputElement && !nameInput.value) {
			nameInput.value = 'pasted-plugin';
		}
	}

	blueprintEventBus.emit('blueprint:updated');
	return true;
}
