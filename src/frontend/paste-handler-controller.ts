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
	detectBlueprintJson,
	detectCss,
	detectJs,
	detectWpCli,
	detectStepJson,
	detectStepLibraryRedirectUrl
} from './content-detection';
import { parsePlaygroundQueryApi, shouldUseMuPlugin } from './playground-integration';
import {
	addStepFromUrl,
	addLandingPageStep,
	addPostStepFromHtml,
	addStepFromPhp,
	addStepFromCss,
	addStepFromJs,
	addStepsFromWpCli,
	type StepInserterDependencies
} from './step-inserter';
import { toastService } from './toast-service';
import { stepsRegistry } from '../steps-registry';

export interface PasteHandlerControllerDependencies {
	stepInserterDeps: StepInserterDependencies;
	restoreSteps: (stepsData: any, title: string) => void;
	appendSteps: (stepsData: any) => void;
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
	 * NOTE: When modifying paste handlers, update the "Smart Paste Handlers" section in docs/tips.md
	 */
	private async handlePaste(event: ClipboardEvent): Promise<void> {
		const pastedText = event.clipboardData?.getData('text');
		if (!pastedText) return;

		const urls = pastedText.split('\n').map(line => line.trim()).filter(line => line);

		// Detect content type (in priority order)
		type ContentType = 'playgroundUrl' | 'playgroundQueryApi' | 'stepLibraryRedirect' | 'stepJson' | 'blueprintJson' | 'php' | 'html' | 'wpCli' | 'css' | 'js' | 'url' | 'wpAdminUrl';
		let detectedType: ContentType | null = null;
		let wpCliCommands: string[] | null = null;

		// Check URL-based content types first
		for (const url of urls) {
			if (detectPlaygroundUrl(url)) {
				detectedType = 'playgroundUrl';
				break;
			}
			if (detectPlaygroundQueryApiUrl(url)) {
				detectedType = 'playgroundQueryApi';
				break;
			}
			if (detectStepLibraryRedirectUrl(url)) {
				detectedType = 'stepLibraryRedirect';
				break;
			}
			if (detectWpAdminUrl(url)) {
				detectedType = 'wpAdminUrl';
				break;
			}
			if (detectUrlType(url)) {
				detectedType = 'url';
				break;
			}
		}

		// Check text-based content types if no URL type found
		if (!detectedType) {
			if (detectBlueprintJson(pastedText)) {
				detectedType = 'blueprintJson';
			} else if (detectStepJson(pastedText)) {
				detectedType = 'stepJson';
			} else if (detectPhp(pastedText)) {
				detectedType = 'php';
			} else if (detectHtml(pastedText)) {
				detectedType = 'html';
			} else {
				wpCliCommands = detectWpCli(pastedText);
				if (wpCliCommands) {
					detectedType = 'wpCli';
				} else if (detectCss(pastedText)) {
					detectedType = 'css';
				} else if (detectJs(pastedText)) {
					detectedType = 'js';
				}
			}
		}

		// If nothing detected, let default paste behavior happen
		if (!detectedType) {
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

		// Handle detected content type
		switch (detectedType) {
			case 'playgroundUrl':
				for (const url of urls) {
					const blueprintData = detectPlaygroundUrl(url);
					if (blueprintData) {
						if (await this.handlePlaygroundBlueprint(blueprintData)) {
							addedAny = true;
						}
						break;
					}
				}
				break;

			case 'playgroundQueryApi':
				for (const url of urls) {
					const blueprintData = parsePlaygroundQueryApi(url);
					if (blueprintData) {
						if (await this.handlePlaygroundBlueprint(blueprintData)) {
							addedAny = true;
						}
						break;
					}
				}
				break;

			case 'stepLibraryRedirect':
				for (const url of urls) {
					const stepsData = detectStepLibraryRedirectUrl(url);
					if (stepsData) {
						const steps = stepsData.map(s => ({ step: s.step, vars: s.vars }));
						this.deps.appendSteps({ steps });
						const stepText = steps.length === 1 ? 'step' : `${steps.length} steps`;
						toastService.showGlobal(`Added ${stepText} from pasted Step Library URL`);
						addedAny = true;
						break;
					}
				}
				break;

			case 'stepJson': {
				const stepData = detectStepJson(pastedText);
				if (stepData) {
					const blueprintData = { steps: [stepData] };
					if (await this.handlePlaygroundBlueprint(blueprintData)) {
						addedAny = true;
					}
				}
				break;
			}

			case 'blueprintJson': {
				const blueprintData = detectBlueprintJson(pastedText);
				if (blueprintData) {
					if (await this.handlePlaygroundBlueprint(blueprintData)) {
						addedAny = true;
					}
				}
				break;
			}

			case 'php':
				if (addStepFromPhp(pastedText, this.deps.stepInserterDeps)) {
					const stepType = shouldUseMuPlugin(pastedText) ? 'MU Plugin' : 'Run PHP';
					toastService.showGlobal(`Added ${stepType} step from pasted PHP code`);
					addedAny = true;
				}
				break;

			case 'html':
				if (addPostStepFromHtml(pastedText, this.deps.stepInserterDeps)) {
					toastService.showGlobal('Added post step from pasted HTML content');
					addedAny = true;
				}
				break;

			case 'wpCli':
				if (wpCliCommands && wpCliCommands.length > 0) {
					const count = addStepsFromWpCli(wpCliCommands, this.deps.stepInserterDeps);
					if (count > 0) {
						const commandText = count === 1 ? 'WP-CLI command' : `${count} WP-CLI commands`;
						toastService.showGlobal(`Added ${commandText} from pasted text`);
						addedAny = true;
					}
				}
				break;

			case 'css':
				if (addStepFromCss(pastedText, this.deps.stepInserterDeps)) {
					toastService.showGlobal('Added CSS enqueue step from pasted styles');
					addedAny = true;
				}
				break;

			case 'js':
				if (addStepFromJs(pastedText, this.deps.stepInserterDeps)) {
					toastService.showGlobal('Added JS enqueue step from pasted script');
					addedAny = true;
				}
				break;

			case 'wpAdminUrl':
				for (const url of urls) {
					const wpAdminPath = detectWpAdminUrl(url);
					if (wpAdminPath) {
						if (addLandingPageStep(wpAdminPath, this.deps.stepInserterDeps)) {
							toastService.showGlobal('Set landing page from pasted admin URL');
							addedAny = true;
						}
						break;
					}
				}
				break;

			case 'url': {
				let urlCount = 0;
				for (const url of urls) {
					if (addStepFromUrl(url, this.deps.stepInserterDeps)) {
						addedAny = true;
						urlCount++;
					}
				}
				if (urlCount > 0) {
					const itemText = urlCount === 1 ? 'plugin/theme' : `${urlCount} plugins/themes`;
					toastService.showGlobal(`Added ${itemText} from pasted URL${urlCount === 1 ? '' : 's'}`);
				}
				break;
			}
		}

		if (addedAny) {
			event.preventDefault();
		}
	}

	/**
	 * Handle playground blueprint by checking for custom steps first, then decompiling native steps
	 */
	private async handlePlaygroundBlueprint(blueprintData: any): Promise<boolean> {
		if (!blueprintData) {
			return false;
		}

		try {
			const allSteps: any[] = [];
			const customSteps: any[] = [];
			const nativeSteps: any[] = [];
			let unmappedSteps: any[] = [];
			let warnings: string[] = [];

			if (blueprintData.preferredVersions) {
				const wpVersionEl = document.getElementById('wp-version') as HTMLSelectElement;
				const phpVersionEl = document.getElementById('php-version') as HTMLSelectElement;

				if (wpVersionEl && blueprintData.preferredVersions.wp) {
					wpVersionEl.value = blueprintData.preferredVersions.wp;
				}
				if (phpVersionEl && blueprintData.preferredVersions.php) {
					phpVersionEl.value = blueprintData.preferredVersions.php;
				}
			}

			const blueprintSteps = blueprintData.steps || [];

			for (const step of blueprintSteps) {
				if ( step.step && step.step in stepsRegistry ) {
					// Use discriminated union logic for steps with both custom and native variants
					// Custom variants use 'url', native uses resource data properties
					if ( step.step === 'installPlugin' && !( 'url' in step ) ) {
						nativeSteps.push( step );
					} else if ( step.step === 'installTheme' && !( 'url' in step ) ) {
						nativeSteps.push( step );
					} else if ( step.step === 'importWxr' && !( 'url' in step ) ) {
						// Custom importWxr uses 'url', native uses 'file' resource
						nativeSteps.push( step );
					} else {
						customSteps.push( step );
					}
				} else {
					nativeSteps.push( step );
				}
			}

			allSteps.push(...customSteps);

			if (nativeSteps.length > 0) {
				const { BlueprintDecompiler } = await import('../decompiler');
				const decompiler = new BlueprintDecompiler();
				const result = decompiler.decompile({...blueprintData, steps: nativeSteps});

				if (result.warnings.length > 0) {
					warnings = result.warnings;
					console.warn('Decompiler warnings:', warnings);
				}

				allSteps.push(...result.steps);
				unmappedSteps = result.unmappedSteps;
			}

			const stepConfig = {
				steps: allSteps.map((step: any) => {
					// If step already has vars property, use it directly (step-library format)
					if ( 'vars' in step && typeof step.vars === 'object' && Object.keys( step ).length === 2 ) {
						return {
							step: step.step,
							vars: step.vars
						};
					}
					// Otherwise, wrap non-step properties into vars (native Playground format)
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

			this.deps.appendSteps(stepConfig);

			if (unmappedSteps.length === 0 && warnings.length === 0) {
				toastService.showGlobal('Playground blueprint loaded successfully!');
			} else if (unmappedSteps.length > 0) {
				const stepTypes = unmappedSteps
					.map((s: any) => s.step || 'unknown')
					.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
				const msg = 'Playground blueprint loaded. Ignored ' + unmappedSteps.length + ' step(s): ' + stepTypes.join(', ');
				toastService.showGlobal(msg, { duration: 5000 });
			} else if (warnings.length > 0) {
				toastService.showGlobal('Playground blueprint loaded with warnings. Check console for details.', { duration: 5000 });
			}

			return true;
		} catch (error) {
			console.error('Error handling playground blueprint:', error);
			toastService.showGlobal('Failed to load playground blueprint', { duration: 5000 });
			return false;
		}
	}
}
