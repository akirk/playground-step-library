/**
 * Blueprint Compilation Controller
 * Manages blueprint compilation, playground URL generation, and preview mode
 */

import PlaygroundStepLibrary, { type CompileOptions } from '../index';
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
			if ( !jsonInput ) {
				return;
			}

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
			const compiler = new PlaygroundStepLibrary();
			if (useV2) {
				outputData = compiler.compileV2(JSON.parse(jsonInput), compileOptions);
			} else {
				outputData = compiler.compile(JSON.parse(jsonInput), compileOptions);
			}

			// Extract query params from the compiler
			const extractedQueryParams = compiler.getLastQueryParams();
			for (const key in extractedQueryParams) {
				queries.push(key + '=' + encodeURIComponent(extractedQueryParams[key]));
			}
		}

		// Add metadata indicating compilation by step library
		const excludeMetaEl = document.getElementById('exclude-meta') as HTMLInputElement;
		const shouldAddMeta = !excludeMetaEl || !excludeMetaEl.checked;

		if (shouldAddMeta) {
			const titleInput = document.getElementById('title') as HTMLInputElement;
			const blueprintTitle = titleInput && titleInput.value ? titleInput.value.trim() : '';

			// Add $schema for validation support
			if (!outputData.$schema) {
				outputData.$schema = 'https://playground.wordpress.net/blueprint-schema.json';
			}

			if (useV2) {
				// V2 uses blueprintMeta
				if (!outputData.blueprintMeta) {
					outputData.blueprintMeta = {};
				}
				if (!outputData.blueprintMeta.name && blueprintTitle) {
					outputData.blueprintMeta.name = blueprintTitle;
				}
				outputData.blueprintMeta.moreInfo = 'https://akirk.github.io/playground-step-library/';
			} else if (outputData.steps && outputData.steps.length > 0) {
				// V1 uses meta
				if (!outputData.meta) {
					outputData.meta = {};
				}
				if (!outputData.meta.title) {
					outputData.meta.title = blueprintTitle || generateLabel();
				}
				outputData.meta.author = 'https://github.com/akirk/playground-step-library';
			}
		}

		// If exclude-meta is checked, remove the meta properties entirely
		if (excludeMetaEl && excludeMetaEl.checked) {
			if (outputData.$schema) {
				delete outputData.$schema;
			}
			if (outputData.meta) {
				delete outputData.meta;
			}
			if (outputData.blueprintMeta) {
				delete outputData.blueprintMeta;
			}
		}

		if (!isManualEditMode.value) {
			// Reorder properties to put blueprintMeta/meta at the end
			const orderedOutput = this.reorderBlueprintProperties(outputData);
			this.deps.setBlueprintValue(JSON.stringify(orderedOutput, null, 2));
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

	/**
	 * Reorder blueprint properties to put metadata at the end
	 */
	private reorderBlueprintProperties(blueprint: any): any {
		const { blueprintMeta, meta, ...rest } = blueprint;
		const result: any = { ...rest };

		// Add meta properties at the end
		if (meta) {
			result.meta = meta;
		}
		if (blueprintMeta) {
			result.blueprintMeta = blueprintMeta;
		}

		return result;
	}
}
