/**
 * File Drop Controller
 * Handles drag-and-drop of JSON files (blueprints and wp-env configs)
 */

import { BlueprintDecompiler } from '../decompiler';
import { detectWpEnvJson } from './content-detection';
import { wpEnvToSteps } from './wpenv-importer';
import { toastService } from './toast-service';
import type { StepConfig } from './types';

export interface FileDropControllerDependencies {
	restoreSteps: (stepsData: StepConfig, title: string) => void;
	showToast: (message: string) => void;
}

export class FileDropController {
	private deps: FileDropControllerDependencies;
	private dropZoneActive = false;

	constructor(deps: FileDropControllerDependencies) {
		this.deps = deps;
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		document.body.addEventListener('dragover', (event) => {
			this.handleDragOver(event);
		});

		document.body.addEventListener('dragleave', (event) => {
			this.handleDragLeave(event);
		});

		document.body.addEventListener('drop', (event) => {
			this.handleDrop(event);
		});
	}

	private handleDragOver(event: DragEvent): void {
		const items = event.dataTransfer?.items;
		if (!items) {
			return;
		}

		const hasFile = Array.from(items).some(item => item.kind === 'file');
		if (!hasFile) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

		if (!this.dropZoneActive) {
			this.dropZoneActive = true;
			document.body.classList.add('blueprint-drop-active');
		}
	}

	private handleDragLeave(event: DragEvent): void {
		if (event.target === document.body || (event.relatedTarget instanceof Node && !document.body.contains(event.relatedTarget))) {
			this.dropZoneActive = false;
			document.body.classList.remove('blueprint-drop-active');
		}
	}

	private handleDrop(event: DragEvent): void {
		const files = event.dataTransfer?.files;
		if (!files || files.length === 0) {
			return;
		}

		const hasJsonFile = Array.from(files).some(file => file.name.endsWith('.json'));
		if (!hasJsonFile) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		this.dropZoneActive = false;
		document.body.classList.remove('blueprint-drop-active');

		this.handleFileDrop(files[0]);
	}

	private async handleFileDrop(file: File): Promise<void> {
		if (!file.name.endsWith('.json')) {
			this.deps.showToast('Please drop a JSON file');
			return;
		}

		try {
			const text = await file.text();
			const data = JSON.parse(text);

			// Check if it's a wp-env.json file
			const wpEnvConfig = detectWpEnvJson(text);
			if (wpEnvConfig) {
				await this.handleWpEnvFile(wpEnvConfig, file.name);
				return;
			}

			// Handle blueprint file
			await this.handleBlueprintFile(data, file.name);

		} catch (error) {
			console.error('File import error:', error);
			const message = error instanceof Error ? error.message : String(error);
			this.deps.showToast('Failed to load file: ' + message);
		}
	}

	private async handleBlueprintFile(data: any, filename: string): Promise<void> {
		let nativeBlueprint = null;
		let title = filename.replace(/\.json$/, '') || 'Imported Blueprint';

		if (data.blueprints && Array.isArray(data.blueprints)) {
			if (data.blueprints.length === 0) {
				this.deps.showToast('No blueprints found in file');
				return;
			}

			if (data.blueprints.length > 1) {
				const choice = confirm('This file contains ' + data.blueprints.length + ' blueprints. Load the first one?');
				if (!choice) {
					return;
				}
			}

			const firstBlueprint = data.blueprints[0];
			if (firstBlueprint.compiledBlueprint) {
				nativeBlueprint = firstBlueprint.compiledBlueprint;
				title = firstBlueprint.title || title;
			} else {
				nativeBlueprint = firstBlueprint;
			}
		} else if (data.compiledBlueprint) {
			nativeBlueprint = data.compiledBlueprint;
			title = data.title || title;
		} else if (data.steps || data.landingPage) {
			nativeBlueprint = data;
		} else {
			this.deps.showToast('Unrecognized JSON format');
			return;
		}

		const decompiler = new BlueprintDecompiler();
		const result = decompiler.decompile(nativeBlueprint);

		if (result.warnings.length > 0) {
			console.warn('Decompiler warnings:', result.warnings);
		}

		const stepConfig: StepConfig = {
			steps: result.steps as any
		};

		this.deps.restoreSteps(stepConfig, title);

		if (result.unmappedSteps.length === 0) {
			this.deps.showToast('Blueprint loaded successfully!');
		} else {
			const stepTypes = result.unmappedSteps.map(s => s.step || 'unknown').filter((v, i, a) => a.indexOf(v) === i);
			const msg = 'Blueprint loaded. Ignored ' + result.unmappedSteps.length + ' step(s): ' + stepTypes.join(', ');
			this.deps.showToast(msg);
			console.warn('Unmapped steps:', result.unmappedSteps);
		}
	}

	private async handleWpEnvFile(config: any, filename: string): Promise<void> {
		const result = wpEnvToSteps(config);

		// If there are unresolved plugins/themes, show dialog to let user provide URLs
		if (result.unresolvedPlugins.length > 0 || result.unresolvedThemes.length > 0) {
			const resolvedSteps = await this.showUnresolvedDialog(result.unresolvedPlugins, result.unresolvedThemes);
			if (resolvedSteps === null) {
				return; // User cancelled
			}
			result.steps.unshift(...resolvedSteps);
		}

		if (result.steps.length === 0) {
			this.deps.showToast('No importable steps found in wp-env.json');
			if (result.warnings.length > 0) {
				console.warn('wp-env import warnings:', result.warnings);
			}
			return;
		}

		const stepConfig: StepConfig = {
			steps: result.steps as any
		};

		const title = filename.replace(/\.json$/, '').replace(/[^a-zA-Z0-9]/g, ' ').trim() || 'wp-env config';
		this.deps.restoreSteps(stepConfig, title);

		// Set PHP version if specified
		if (result.phpVersion) {
			const phpVersionEl = document.getElementById('php-version') as HTMLSelectElement;
			if (phpVersionEl) {
				phpVersionEl.value = result.phpVersion;
			}
		}

		// Set WordPress version if specified
		if (result.wpVersion) {
			const wpVersionEl = document.getElementById('wp-version') as HTMLSelectElement;
			if (wpVersionEl) {
				wpVersionEl.value = result.wpVersion;
			}
		}

		const stepText = result.steps.length === 1 ? '1 step' : `${result.steps.length} steps`;
		this.deps.showToast(`Imported ${stepText} from wp-env.json`);

		if (result.warnings.length > 0) {
			console.info('wp-env import notes:', result.warnings);
			for (const warning of result.warnings.slice(0, 3)) {
				toastService.showGlobal(warning, { duration: 5000 });
			}
			if (result.warnings.length > 3) {
				toastService.showGlobal(`...and ${result.warnings.length - 3} more notes (see console)`, { duration: 5000 });
			}
		}
	}

	private showUnresolvedDialog(
		unresolvedPlugins: string[],
		unresolvedThemes: string[]
	): Promise<Array<{ step: 'installPlugin' | 'installTheme'; vars: { url: string } }> | null> {
		return new Promise((resolve) => {
			const dialog = document.getElementById('wpenv-unresolved-dialog') as HTMLDialogElement;
			const itemsContainer = document.getElementById('wpenv-unresolved-items')!;
			const importBtn = document.getElementById('wpenv-unresolved-import')!;
			const skipBtn = document.getElementById('wpenv-unresolved-skip')!;
			const cancelBtn = document.getElementById('wpenv-unresolved-cancel')!;

			// Clear previous content
			while (itemsContainer.firstChild) {
				itemsContainer.removeChild(itemsContainer.firstChild);
			}

			const inputs: Array<{ type: 'plugin' | 'theme'; path: string; input: HTMLInputElement }> = [];

			const handleInputKeydown = ( e: KeyboardEvent ) => {
				if ( e.key === 'Enter' ) {
					e.preventDefault();
					e.stopPropagation();
					importBtn.click();
				}
			};

			for (const path of unresolvedPlugins) {
				const label = document.createElement('label');
				const strong = document.createElement('strong');
				strong.textContent = 'Plugin: ';
				label.appendChild(strong);
				const code = document.createElement('code');
				code.textContent = 'plugins: [ "' + path + '" ]';
				label.appendChild(code);
				label.appendChild(document.createElement('br'));
				const input = document.createElement('input');
				input.type = 'text';
				input.placeholder = 'Enter plugin URL or WordPress.org slug (leave empty to skip)';
				input.style.width = '100%';
				input.style.marginBottom = '10px';
				input.addEventListener( 'keydown', handleInputKeydown );
				label.appendChild(input);
				itemsContainer.appendChild(label);
				inputs.push({ type: 'plugin', path, input });
			}

			for (const path of unresolvedThemes) {
				const label = document.createElement('label');
				const strong = document.createElement('strong');
				strong.textContent = 'Theme: ';
				label.appendChild(strong);
				const code = document.createElement('code');
				code.textContent = 'themes: [ "' + path + '" ]';
				label.appendChild(code);
				label.appendChild(document.createElement('br'));
				const input = document.createElement('input');
				input.type = 'text';
				input.placeholder = 'Enter theme URL or WordPress.org slug (leave empty to skip)';
				input.style.width = '100%';
				input.style.marginBottom = '10px';
				input.addEventListener( 'keydown', handleInputKeydown );
				label.appendChild(input);
				itemsContainer.appendChild(label);
				inputs.push({ type: 'theme', path, input });
			}

			const cleanup = () => {
				importBtn.removeEventListener('click', onImport);
				skipBtn.removeEventListener('click', onSkip);
				cancelBtn.removeEventListener('click', onCancel);
				dialog.close();
			};

			const onImport = () => {
				const steps: Array<{ step: 'installPlugin' | 'installTheme'; vars: { url: string } }> = [];
				for (const { type, input } of inputs) {
					const url = input.value.trim();
					if (url) {
						steps.push({
							step: type === 'plugin' ? 'installPlugin' : 'installTheme',
							vars: { url }
						});
					}
				}
				cleanup();
				resolve(steps);
			};

			const onSkip = () => {
				cleanup();
				resolve([]);
			};

			const onCancel = () => {
				cleanup();
				resolve(null);
			};

			importBtn.addEventListener('click', onImport);
			skipBtn.addEventListener('click', onSkip);
			cancelBtn.addEventListener('click', onCancel);

			dialog.showModal();
		});
	}
}
