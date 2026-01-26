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
	detectWpEnvJson,
	detectCss,
	detectJs,
	detectWpCli,
	detectStepJson,
	detectStepLibraryRedirectUrl,
	isSiteHealthContent,
	parseSiteHealth
} from './content-detection';
import { wpEnvToSteps } from './wpenv-importer';
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
import { BlueprintDecompiler } from '../decompiler';
import { blueprintEventBus } from './blueprint-event-bus';
import { showUnresolvedDialog } from './wpenv-unresolved-dialog';

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
		const clipboardData = event.clipboardData;
		if ( !clipboardData ) return;

		const clipboardContents: Record<string, string> = {};
		for ( const type of clipboardData.types ) {
			const data = clipboardData.getData( type );
			if ( data ) {
				clipboardContents[type] = data;
			}
		}

		const pastedText = clipboardContents['text/plain'] || clipboardContents['text'] || '';
		const pastedHtml = clipboardContents['text/html'] || '';

		if ( !pastedText && !pastedHtml ) return;

		const urls = pastedText.split( '\n' ).map( line => line.trim() ).filter( line => line );

		// Detect content type (in priority order)
		type ContentType = 'playgroundUrl' | 'playgroundQueryApi' | 'stepLibraryRedirect' | 'stepJson' | 'blueprintJson' | 'wpEnvJson' | 'siteHealth' | 'php' | 'html' | 'wpCli' | 'css' | 'js' | 'url' | 'wpAdminUrl';
		let detectedType: ContentType | null = null;
		let wpCliCommands: string[] | null = null;
		let htmlContent = '';

		// Check URL-based content types first
		console.log( '[handlePaste] Checking', urls.length, 'URLs' );
		for ( const url of urls ) {
			console.log( '[handlePaste] Checking URL:', url.substring( 0, 100 ) + '...' );
			const playgroundResult = detectPlaygroundUrl( url );
			if ( playgroundResult ) {
				console.log( '[handlePaste] Detected as playgroundUrl' );
				detectedType = 'playgroundUrl';
				break;
			}
			if ( detectPlaygroundQueryApiUrl( url ) ) {
				console.log( '[handlePaste] Detected as playgroundQueryApi' );
				detectedType = 'playgroundQueryApi';
				break;
			}
			if ( detectStepLibraryRedirectUrl( url ) ) {
				detectedType = 'stepLibraryRedirect';
				break;
			}
			if ( detectWpAdminUrl( url ) ) {
				detectedType = 'wpAdminUrl';
				break;
			}
			if ( detectUrlType( url ) ) {
				detectedType = 'url';
				break;
			}
		}

		// Check text-based content types if no URL type found
		if ( !detectedType ) {
			if ( detectWpEnvJson( pastedText ) ) {
				detectedType = 'wpEnvJson';
			} else if ( detectBlueprintJson( pastedText ) ) {
				detectedType = 'blueprintJson';
			} else if ( detectStepJson( pastedText ) ) {
				detectedType = 'stepJson';
			} else if ( isSiteHealthContent( pastedText ) ) {
				detectedType = 'siteHealth';
			} else if ( detectPhp( pastedText ) ) {
				detectedType = 'php';
			} else if ( pastedHtml && detectHtml( pastedHtml ) ) {
				// Prefer text/html clipboard type for HTML detection
				detectedType = 'html';
				htmlContent = pastedHtml;
			} else if ( detectHtml( pastedText ) ) {
				detectedType = 'html';
				htmlContent = pastedText;
			} else {
				wpCliCommands = detectWpCli( pastedText );
				if ( wpCliCommands ) {
					detectedType = 'wpCli';
				} else if ( detectCss( pastedText ) ) {
					detectedType = 'css';
				} else if ( detectJs( pastedText ) ) {
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
				console.log( '[handlePaste] Processing playgroundQueryApi' );
				for (const url of urls) {
					console.log( '[handlePaste] Parsing query API URL:', url.substring( 0, 100 ) );
					try {
						const blueprintData = parsePlaygroundQueryApi(url);
						console.log( '[handlePaste] parsePlaygroundQueryApi result:', blueprintData );
						if (blueprintData) {
							if (await this.handlePlaygroundBlueprint(blueprintData)) {
								addedAny = true;
							}
							break;
						}
					} catch (e) {
						const errorMsg = e instanceof Error ? e.message : String(e);
						toastService.showGlobal('Failed to parse Playground URL', { duration: 5000, moreInfo: errorMsg });
						event.preventDefault();
						return;
					}
				}
				break;

			case 'stepLibraryRedirect':
				for (const url of urls) {
					const stepsData = detectStepLibraryRedirectUrl(url);
					if (stepsData) {
						const steps = stepsData.map(s => ({ step: s.step, vars: s.vars }));
						this.deps.appendSteps({ steps });
						blueprintEventBus.emit( 'blueprint:updated' );
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

			case 'wpEnvJson': {
				const wpEnvConfig = detectWpEnvJson( pastedText );
				if ( wpEnvConfig ) {
					const result = wpEnvToSteps( wpEnvConfig );

					// Show dialog for unresolved local paths
					if ( result.unresolvedPlugins.length > 0 || result.unresolvedThemes.length > 0 ) {
						const resolvedSteps = await showUnresolvedDialog( result.unresolvedPlugins, result.unresolvedThemes );
						if ( resolvedSteps === null ) {
							break; // User cancelled
						}
						result.steps.unshift( ...resolvedSteps );
						// Remove local path warnings since we handled them
						result.warnings = result.warnings.filter( w => !w.includes( 'Local plugin path' ) && !w.includes( 'Local theme path' ) );
					}

					if ( result.steps.length > 0 ) {
						this.deps.appendSteps( { steps: result.steps } );
						blueprintEventBus.emit( 'blueprint:updated' );
						const stepText = result.steps.length === 1 ? 'step' : `${result.steps.length} steps`;
						toastService.showGlobal( `Added ${stepText} from wp-env.json` );
						addedAny = true;
					}
					if ( result.warnings.length > 0 ) {
						for ( const warning of result.warnings ) {
							toastService.showGlobal( warning, { duration: 5000 } );
						}
					}
				}
				break;
			}

			case 'siteHealth': {
				const siteHealthData = parseSiteHealth( pastedText );
				if ( siteHealthData ) {
					const steps: any[] = [];

					if ( siteHealthData.theme ) {
						steps.push( {
							step: 'installTheme',
							vars: { url: siteHealthData.theme }
						} );
					}

					for ( const plugin of siteHealthData.plugins ) {
						steps.push( {
							step: 'installPlugin',
							vars: { url: plugin }
						} );
					}

					if ( steps.length > 0 ) {
						this.deps.appendSteps( { steps } );
						blueprintEventBus.emit( 'blueprint:updated' );
						const parts: string[] = [];
						if ( siteHealthData.theme ) {
							parts.push( '1 theme' );
						}
						if ( siteHealthData.plugins.length > 0 ) {
							parts.push( `${siteHealthData.plugins.length} plugin${siteHealthData.plugins.length === 1 ? '' : 's'}` );
						}
						toastService.showGlobal( `Added ${parts.join( ' and ' )} from Site Health info` );
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
				if ( addPostStepFromHtml( htmlContent, this.deps.stepInserterDeps ) ) {
					toastService.showGlobal( 'Added post step from pasted HTML content' );
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
		console.log( '[handlePlaygroundBlueprint] Called with:', blueprintData );
		if (!blueprintData) {
			console.log( '[handlePlaygroundBlueprint] No blueprint data, returning false' );
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

			for ( const step of blueprintSteps ) {
				// Steps with 'vars' property are step-library format (custom steps)
				if ( step.vars ) {
					customSteps.push( step );
				} else {
					nativeSteps.push( step );
				}
			}

			allSteps.push(...customSteps);

			if (nativeSteps.length > 0) {
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

			console.log( '[handlePlaygroundBlueprint] Appending steps:', stepConfig );
			this.deps.appendSteps(stepConfig);

			if (blueprintData.meta?.title) {
				const titleInput = document.getElementById('title') as HTMLInputElement;
				if (titleInput) {
					titleInput.value = blueprintData.meta.title;
				}
			}

			blueprintEventBus.emit( 'blueprint:updated' );

			if (allSteps.length === 0) {
				toastService.showGlobal('No steps found in Playground URL', { duration: 5000 });
			} else if (unmappedSteps.length === 0 && warnings.length === 0) {
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
