/**
 * Step Inserter
 * Functions for inserting steps into the blueprint with dependency injection
 */

import { StepDefinition, ShowCallbacks } from './types';
import { createStep } from './step-renderer';
import { fixMouseCursor } from './dom-utils';
import { detectUrlType, normalizeWordPressUrl } from './content-detection';
import { shouldUseMuPlugin } from './playground-integration';
import { blueprintEventBus } from './blueprint-event-bus';

export interface StepInserterDependencies {
	blueprintSteps: HTMLElement;
	customSteps: Record<string, StepDefinition>;
	showCallbacks: ShowCallbacks;
}

/**
 * Extract plugin name from PHP code header
 */
function extractPluginName(phpCode: string): string | null {
	const pluginNameMatch = phpCode.match(/\*\s*Plugin\s+Name:\s*(.+)/i);
	if (pluginNameMatch) {
		return pluginNameMatch[1].trim();
	}
	return null;
}

/**
 * Convert plugin name to slug
 */
function nameToSlug(name: string): string {
	return name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
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

	const normalizedUrl = normalizeWordPressUrl(url, urlType);

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
		urlInput.value = normalizedUrl;
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
		if (nameInput instanceof HTMLInputElement) {
			const pluginName = extractPluginName(phpCode);
			nameInput.value = pluginName ? nameToSlug(pluginName) : 'pasted-plugin';
		}
	}

	blueprintEventBus.emit('blueprint:updated');
	return true;
}

/**
 * Add a CSS enqueue step from CSS code
 */
export function addStepFromCss(
	cssCode: string,
	deps: StepInserterDependencies
): boolean {
	if (!cssCode || !cssCode.trim()) {
		return false;
	}

	const stepData = deps.customSteps['enqueueCss'];

	if (!stepData) {
		return false;
	}

	removeDragHint(deps.blueprintSteps);

	const stepElement = createStep('enqueueCss', stepData, deps.showCallbacks);
	deps.blueprintSteps.appendChild(stepElement);
	stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

	const cssInput = stepElement.querySelector('textarea[name="css"]');
	if (cssInput instanceof HTMLTextAreaElement) {
		cssInput.value = cssCode;
	}

	const filenameInput = stepElement.querySelector('input[name="filename"]');
	if (filenameInput instanceof HTMLInputElement && !filenameInput.value) {
		filenameInput.value = 'pasted-styles';
	}

	blueprintEventBus.emit('blueprint:updated');
	return true;
}

/**
 * Add a JS enqueue step from JavaScript code
 */
export function addStepFromJs(
	jsCode: string,
	deps: StepInserterDependencies
): boolean {
	if (!jsCode || !jsCode.trim()) {
		return false;
	}

	const stepData = deps.customSteps['enqueueJs'];

	if (!stepData) {
		return false;
	}

	removeDragHint(deps.blueprintSteps);

	const stepElement = createStep('enqueueJs', stepData, deps.showCallbacks);
	deps.blueprintSteps.appendChild(stepElement);
	stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

	const jsInput = stepElement.querySelector('textarea[name="js"]');
	if (jsInput instanceof HTMLTextAreaElement) {
		jsInput.value = jsCode;
	}

	const filenameInput = stepElement.querySelector('input[name="filename"]');
	if (filenameInput instanceof HTMLInputElement && !filenameInput.value) {
		filenameInput.value = 'pasted-script';
	}

	blueprintEventBus.emit('blueprint:updated');
	return true;
}

/**
 * Add WP-CLI command steps from an array of commands
 */
export function addStepsFromWpCli(
	commands: string[],
	deps: StepInserterDependencies
): number {
	const stepData = deps.customSteps['runWpCliCommand'];

	if (!stepData) {
		return 0;
	}

	let addedCount = 0;

	for (const command of commands) {
		removeDragHint(deps.blueprintSteps);

		const stepElement = createStep('runWpCliCommand', stepData, deps.showCallbacks);
		deps.blueprintSteps.appendChild(stepElement);
		stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

		const commandInput = stepElement.querySelector('input[name="command"],textarea[name="command"]');
		if (commandInput instanceof HTMLInputElement || commandInput instanceof HTMLTextAreaElement) {
			commandInput.value = command;
		}

		addedCount++;
	}

	if (addedCount > 0) {
		blueprintEventBus.emit('blueprint:updated');
	}

	return addedCount;
}
