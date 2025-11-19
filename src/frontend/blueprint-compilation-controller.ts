/**
 * Blueprint Compilation Controller
 * Manages blueprint compilation, playground URL generation, and preview mode
 */

import PlaygroundStepLibrary, { PlaygroundStepLibraryV2, type CompileOptions } from '../index';
import { isManualEditMode, getBlueprint } from './app-state';
import { encodeStringAsBase64 } from './utils';
import { generateLabel } from './label-generator';
import { updateBlueprintSizeWarning, handleSplitViewMode, type BlueprintUIDependencies } from './blueprint-ui';

export interface BlueprintCompilationControllerDependencies {
	getBlueprintValue: () => string;
	setBlueprintValue: (value: string) => void;
	blueprintUIDeps: BlueprintUIDependencies;
}

export class BlueprintCompilationController {
	private deps: BlueprintCompilationControllerDependencies;

	constructor(deps: BlueprintCompilationControllerDependencies) {
		this.deps = deps;
	}

	/**
	 * Transform and compile the blueprint JSON
	 * This orchestrates blueprint compilation, URL generation, and preview mode updates
	 */
	transformJson(): void {
		const queries: string[] = [];
		let useBlueprintURLParam = false;
		let outputData: any;
		const useV2 = (document.querySelector('input[name="blueprint-version"]:checked') as HTMLInputElement)?.value === 'v2';

		// If in manual edit mode, use the manually edited blueprint directly
		if (isManualEditMode.value) {
			try {
				const manualBlueprint = this.deps.getBlueprintValue();
				outputData = manualBlueprint ? JSON.parse(manualBlueprint) : {};
			} catch (e) {
				console.error('Invalid JSON in manual edit mode:', e);
				alert('Invalid JSON in blueprint. Please fix syntax errors before launching.');
				return;
			}
		} else {
			const jsonInput = getBlueprint();

			// Prepare compilation options from UI elements
			const compileOptions: CompileOptions = {
				landingPage: '/',
				features: {}
			};

			const networkingEl = document.getElementById('networking') as HTMLInputElement;
			if (networkingEl && !networkingEl.checked) {
				compileOptions.features!.networking = false;
			}

			const wpCliEl = document.getElementById('wp-cli') as HTMLInputElement;
			if (wpCliEl && wpCliEl.checked) {
				compileOptions.extraLibraries = ['wp-cli'];
			}

			const wpVersionEl = document.getElementById('wp-version') as HTMLSelectElement;
			const phpVersionEl = document.getElementById('php-version') as HTMLSelectElement;
			if (wpVersionEl && phpVersionEl) {
				compileOptions.preferredVersions = {
					wp: wpVersionEl.value,
					php: phpVersionEl.value
				};
			}

			// Use the appropriate compiler based on version selection
			if (useV2) {
				const compilerV2 = new PlaygroundStepLibraryV2();
				outputData = compilerV2.compile(JSON.parse(jsonInput), compileOptions);

				// Extract query params from the v2 compiler
				const extractedQueryParams = compilerV2.getLastQueryParams();
				for (const key in extractedQueryParams) {
					queries.push(key + '=' + encodeURIComponent(extractedQueryParams[key]));
				}
			} else {
				const compiler = new PlaygroundStepLibrary();
				outputData = compiler.compile(JSON.parse(jsonInput), compileOptions);

				// Extract query params from the v1 compiler
				const extractedQueryParams = compiler.getLastQueryParams();
				for (const key in extractedQueryParams) {
					queries.push(key + '=' + encodeURIComponent(extractedQueryParams[key]));
				}
			}
	}

		// Add metadata indicating compilation by step library (only if there are steps)
		const excludeMetaEl = document.getElementById('exclude-meta') as HTMLInputElement;
		if (outputData.steps && outputData.steps.length > 0 && (!excludeMetaEl || !excludeMetaEl.checked)) {
			if (!outputData.meta) {
				outputData.meta = {};
			}
			// Ensure meta has a title (required by schema)
			if (!outputData.meta.title) {
				const titleInput = document.getElementById('title') as HTMLInputElement;
				const blueprintTitle = titleInput && titleInput.value ? titleInput.value.trim() : '';
				outputData.meta.title = blueprintTitle || generateLabel();
			}
			outputData.meta.author = 'https://github.com/akirk/playground-step-library';
		}

		// If exclude-meta is checked, remove the meta property entirely
		if (excludeMetaEl && excludeMetaEl.checked && outputData.meta) {
			delete outputData.meta;
		}

		if (!isManualEditMode.value) {
			this.deps.setBlueprintValue(JSON.stringify(outputData, null, 2));
		}

		// Add autosave query params
		const autosaveEl = document.getElementById('autosave') as HTMLInputElement;
		if (autosaveEl && autosaveEl.value) {
			queries.push('site-slug=' + encodeURIComponent(autosaveEl.value.replace(/[^a-z0-9-]/gi, '')));
			queries.push('if-stored-site-missing=prompt');
		}

		// Add mode query params
		const modeEl = document.getElementById('mode') as HTMLSelectElement;
		if (modeEl) {
			switch (modeEl.value) {
				case 'browser':
					queries.push('mode=browser');
					break;
				case 'seamless':
					queries.push('mode=seamless');
					break;
				case 'split-view-bottom':
				case 'split-view-right':
					queries.push('mode=seamless');
					break;
			}
		}

		// Add storage query params
		const storageEl = document.getElementById('storage') as HTMLSelectElement;
		if (storageEl) {
			switch (storageEl.value) {
				case 'browser':
					queries.push('storage=browser');
					break;
				case 'device':
					queries.push('storage=device');
					break;
			}
		}

		if (useV2) {
			queries.push('experimental-blueprints-v2-runner=yes');
		}

		// Determine encoding format
		const encodingFormatEl = document.getElementById('encoding-format') as HTMLSelectElement;
		const encodingFormat = encodingFormatEl ? encodingFormatEl.value : 'auto';
		let hash = '#' + (JSON.stringify(outputData).replace(/%/g, '%25'));

		if (encodingFormat === 'auto') {
			if (hash.length > 2000) {
				useBlueprintURLParam = true;
			}
		} else if (encodingFormat === 'base64') {
			useBlueprintURLParam = true;
		}

		if (useBlueprintURLParam) {
			queries.push('blueprint-url=data:application/json;base64,' + encodeURIComponent(encodeStringAsBase64(JSON.stringify(outputData))));
			hash = '';
		}

		const query = (queries.length ? '?' + queries.join('&') : '');
		const playgroundEl = document.getElementById('playground') as HTMLInputElement;
		const playground = playgroundEl ? playgroundEl.value : 'playground.wordpress.net';
		const href = (playground.substr(0, 7) === 'http://' ? playground : 'https://' + playground) + '/' + query + hash;

		const playgroundLinkEl = document.getElementById('playground-link') as HTMLAnchorElement;
		if (playgroundLinkEl) {
			playgroundLinkEl.href = href;
		}

		// Check blueprint size and show warning if needed
		updateBlueprintSizeWarning(href);

		// Handle split view mode
		handleSplitViewMode(href, this.deps.blueprintUIDeps);
	}
}
