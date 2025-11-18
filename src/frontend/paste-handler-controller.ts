/**
 * Paste Handler Controller
 * Manages paste events, content type detection, and blueprint decompilation
 */

import {
	detectUrlType,
	detectWpAdminUrl,
	detectHtml,
	detectPhp,
	detectPlaygroundUrl,
	detectPlaygroundQueryApiUrl,
	detectBlueprintJson
} from './content-detection';
import { parsePlaygroundQueryApi } from './playground-integration';
import {
	addStepFromUrl,
	addLandingPageStep,
	addPostStepFromHtml,
	addStepFromPhp,
	type StepInserterDependencies
} from './step-inserter';
import { toastService } from './toast-service';

export interface PasteHandlerControllerDependencies {
	stepInserterDeps: StepInserterDependencies;
	restoreSteps: (stepsData: any, title: string) => void;
}

export class PasteHandlerController {
	private deps: PasteHandlerControllerDependencies;

	constructor(deps: PasteHandlerControllerDependencies) {
		this.deps = deps;
		this.setupEventListeners();
	}

	/**
	 * Setup paste event listener
	 */
	private setupEventListeners(): void {
		window.addEventListener('paste', async (event) => {
			await this.handlePaste(event);
		});
	}

	/**
	 * Handle paste event
	 */
	private async handlePaste(event: ClipboardEvent): Promise<void> {
		const pastedText = event.clipboardData?.getData('text');
		if (!pastedText) return;

		const urls = pastedText.split('\n').map(line => line.trim()).filter(line => line);

		// Detect content types
		let hasPlaygroundUrl = false;
		let hasPlaygroundQueryApiUrl = false;
		let hasBlueprintJson = false;
		let hasUrl = false;
		let hasWpAdminUrl = false;
		let hasHtml = false;
		let hasPhp = false;

		for (const url of urls) {
			if (detectPlaygroundUrl(url)) {
				hasPlaygroundUrl = true;
				break;
			}
			if (detectPlaygroundQueryApiUrl(url)) {
				hasPlaygroundQueryApiUrl = true;
				break;
			}
			if (detectUrlType(url)) {
				hasUrl = true;
				break;
			}
			if (detectWpAdminUrl(url)) {
				hasWpAdminUrl = true;
				break;
			}
		}

		if (detectBlueprintJson(pastedText)) {
			hasBlueprintJson = true;
		}

		if (detectPhp(pastedText)) {
			hasPhp = true;
		}

		if (detectHtml(pastedText)) {
			hasHtml = true;
		}

		// If nothing detected, let default paste behavior happen
		if (!hasPlaygroundUrl && !hasPlaygroundQueryApiUrl && !hasBlueprintJson && !hasUrl && !hasWpAdminUrl && !hasHtml && !hasPhp) {
			return;
		}

		// Don't intercept paste in input/textarea fields (except filter)
		const target = event.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
			if (target.id !== 'filter') {
				return;
			}
		}

		let addedAny = false;

		// Handle different content types in priority order
		if (hasPlaygroundUrl) {
			for (const url of urls) {
				const blueprintData = detectPlaygroundUrl(url);
				if (blueprintData) {
					if (await this.handlePlaygroundBlueprint(blueprintData)) {
						addedAny = true;
					}
					break;
				}
			}
		} else if (hasPlaygroundQueryApiUrl) {
			for (const url of urls) {
				const blueprintData = parsePlaygroundQueryApi(url);
				if (blueprintData) {
					if (await this.handlePlaygroundBlueprint(blueprintData)) {
						addedAny = true;
					}
					break;
				}
			}
		} else if (hasBlueprintJson) {
			const blueprintData = detectBlueprintJson(pastedText);
			if (blueprintData) {
				if (await this.handlePlaygroundBlueprint(blueprintData)) {
					addedAny = true;
				}
			}
		} else if (hasPhp && !hasUrl && !hasWpAdminUrl) {
			if (addStepFromPhp(pastedText, this.deps.stepInserterDeps)) {
				addedAny = true;
			}
		} else if (hasHtml && !hasUrl && !hasWpAdminUrl) {
			if (addPostStepFromHtml(pastedText, this.deps.stepInserterDeps)) {
				addedAny = true;
			}
		} else {
			for (const url of urls) {
				const wpAdminPath = detectWpAdminUrl(url);
				if (wpAdminPath) {
					if (addLandingPageStep(wpAdminPath, this.deps.stepInserterDeps)) {
						addedAny = true;
					}
				} else if (addStepFromUrl(url, this.deps.stepInserterDeps)) {
					addedAny = true;
				}
			}
		}

		if (addedAny) {
			event.preventDefault();
		}
	}

	/**
	 * Handle playground blueprint by decompiling and loading it
	 */
	private async handlePlaygroundBlueprint(blueprintData: any): Promise<boolean> {
		if (!blueprintData) {
			return false;
		}

		try {
			const { BlueprintDecompiler } = await import('../decompiler');
			const decompiler = new BlueprintDecompiler();
			const result = decompiler.decompile(blueprintData);

			if (result.warnings.length > 0) {
				console.warn('Decompiler warnings:', result.warnings);
			}

			const stepConfig = {
				steps: result.steps.map((step: any) => {
					const vars: Record<string, any> = {};
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

			this.deps.restoreSteps(stepConfig, 'Playground Blueprint');

			if (result.unmappedSteps.length === 0) {
				toastService.showWithUndo('Playground blueprint loaded successfully!');
			} else {
				const stepTypes = result.unmappedSteps
					.map((s: any) => s.step || 'unknown')
					.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
				const msg = 'Playground blueprint loaded. Ignored ' + result.unmappedSteps.length + ' step(s): ' + stepTypes.join(', ');
				toastService.showWithUndo(msg);
			}

			return true;
		} catch (error) {
			console.error('Error handling playground blueprint:', error);
			toastService.showWithUndo('Failed to load playground blueprint');
			return false;
		}
	}
}
