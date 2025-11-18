/**
 * State Controller
 * Manages application state restoration, compression, and URL handling
 */

import { compressState, extractStepDataFromElement, type StepConfig } from './blueprint-compiler';
import { migrateState } from './state-migration';
import { fixMouseCursor } from './dom-utils';
import { blueprintEventBus } from './blueprint-event-bus';

export interface StateControllerDependencies {
	blueprintSteps: HTMLElement;
	stepList: HTMLElement;
}

export class StateController {
	private deps: StateControllerDependencies;

	constructor(deps: StateControllerDependencies) {
		this.deps = deps;
	}

	/**
	 * Compress current DOM state into a string
	 */
	compressStateFromDOM(steps: any[]): string {
		const titleEl = document.getElementById('title') as HTMLInputElement;
		const autosaveEl = document.getElementById('autosave') as HTMLInputElement;
		const playgroundEl = document.getElementById('playground') as HTMLInputElement;
		const modeEl = document.getElementById('mode') as HTMLSelectElement;
		const previewModeEl = document.getElementById('preview-mode') as HTMLInputElement;
		const excludeMetaEl = document.getElementById('exclude-meta') as HTMLInputElement;
		const wpVersionEl = document.getElementById('wp-version') as HTMLSelectElement;
		const phpVersionEl = document.getElementById('php-version') as HTMLSelectElement;

		return compressState(steps, {
			title: titleEl?.value || undefined,
			autosave: autosaveEl?.value || undefined,
			playground: playgroundEl?.value || undefined,
			mode: modeEl?.value || undefined,
			previewMode: previewModeEl?.value || undefined,
			excludeMeta: excludeMetaEl?.checked || undefined,
			wpVersion: wpVersionEl?.value || undefined,
			phpVersion: phpVersionEl?.value || undefined
		});
	}

	/**
	 * Restore application state from compressed state object
	 */
	restoreState(state: any): void {
		if (!state) {
			return;
		}

		// Apply migrations before restoring
		state = migrateState(state);
		if (state.title) {
			(document.getElementById('title') as HTMLInputElement).value = state.title;
		}
		if (state.autosave) {
			(document.getElementById('autosave') as HTMLInputElement).value = state.autosave;
		}
		if (state.playground) {
			(document.getElementById('playground') as HTMLInputElement).value = state.playground;
		}
		if (state.mode) {
			(document.getElementById('mode') as HTMLSelectElement).value = state.mode;
		}
		if (state.previewMode) {
			(document.getElementById('preview-mode') as HTMLInputElement).value = state.previewMode;
		}
		if (state.excludeMeta !== undefined) {
			(document.getElementById('exclude-meta') as HTMLInputElement).checked = state.excludeMeta;
		}
		if (state.wpVersion) {
			(document.getElementById('wp-version') as HTMLSelectElement).value = state.wpVersion;
		}
		if (state.phpVersion) {
			(document.getElementById('php-version') as HTMLSelectElement).value = state.phpVersion;
		}
		if (!(state.steps || []).length) {
			return;
		}
		this.deps.blueprintSteps.textContent = '';
		(state.steps || []).forEach((step: any) => {
			if (typeof step.step === 'undefined') {
				if (typeof step.title === 'string') {
					(document.getElementById('title') as HTMLInputElement).value = step.title;
				}
				return;
			}
			let possibleBlocks: Element[] | NodeListOf<Element> = this.deps.stepList.querySelectorAll('[data-step="' + step.step + '"]');
			if (!possibleBlocks.length) {
				return;
			}
			if (possibleBlocks.length > 1) {
				const keys = Object.keys(step.vars || {});
				possibleBlocks = Array.from(possibleBlocks).filter((block) => {
					for (const key of keys) {
						const vars = Array.isArray(step.vars[key]) ? step.vars[key] : [step.vars[key]];
						const inputs = block.querySelectorAll('[name="' + key + '"]');
						if (inputs.length !== vars.length) {
							return false;
						}
						for (let i = 0; i < inputs.length; i++) {
							const input = inputs[i] as HTMLInputElement;
							const value = vars[i];
							if ('checkbox' === input.type) {
								if (input.checked !== (value === 'true' || value === true)) {
									return false;
								}
							} else if (input.value !== value) {
								return false;
							}
						}
					}
					return true;
				});
				if (0 === possibleBlocks.length) {
					possibleBlocks = Array.from(this.deps.stepList.querySelectorAll('[data-step="' + step.step + '"]')).filter((block) => {
						if (block.classList.contains('mine')) {
							return false;
						}
						return true;
					});
				}
			}
			const block = possibleBlocks[0];
			const stepBlock = block.cloneNode(true) as HTMLElement;
			stepBlock.classList.remove('dragging');
			this.deps.blueprintSteps.appendChild(stepBlock);
			stepBlock.querySelectorAll('input,textarea').forEach(fixMouseCursor);
			if (step.count) {
				(stepBlock.querySelector('[name="count"]') as HTMLInputElement).value = step.count;
			}
			Object.keys(step.vars || {}).forEach((key) => {
				if (key === 'step') {
					return;
				}
				const input = stepBlock.querySelector('[name="' + key + '"]') as HTMLInputElement | HTMLTextAreaElement;
				if (!input) {
					console.warn('Step "' + step.step + '" is missing variable "' + key + '" - step definition may have changed');
					return;
				}
				if (Array.isArray(step.vars[key])) {
					step.vars[key].forEach((value: any, index: number) => {
						if (!value) {
							return;
						}
						const inputs = stepBlock.querySelectorAll('[name="' + key + '"]');
						if (typeof inputs[index] === 'undefined') {
							const vars = stepBlock.querySelector('.vars');
							const clone = vars!.cloneNode(true);
							vars!.parentNode!.appendChild(clone);
						}
						const input = stepBlock.querySelectorAll('[name="' + key + '"]')[index] as HTMLInputElement | HTMLTextAreaElement;
						if (!input) {
							console.warn('Step "' + step.step + '" is missing variable "' + key + '" at index ' + index + ' - step definition may have changed');
							return;
						}
						if ('checkbox' === input.type) {
							(input as HTMLInputElement).checked = value === 'true' || value === true;
						} else {
							input.value = value;
						}
					});
					return;
				}

				if ('checkbox' === input.type) {
					(input as HTMLInputElement).checked = step.vars[key] === 'true' || step.vars[key] === true;
				} else {
					input.value = step.vars[key];
				}
			});
		});
		blueprintEventBus.emit('blueprint:updated');
	}

	/**
	 * Show auto-redirect dialog with countdown
	 */
	autoredirect(delay: number = 5): void {
		const dialog = document.getElementById('autoredirecting') as HTMLDialogElement;
		dialog.showModal();
		(document.getElementById('autoredirect-title') as HTMLElement).textContent = (document.getElementById('title') as HTMLInputElement).value;
		let seconds = delay;
		(document.getElementById('autoredirecting-seconds') as HTMLElement).innerText = seconds + ' second' + (seconds === 1 ? '' : 's');
		const interval = setInterval(() => {
			seconds--;
			(document.getElementById('autoredirecting-seconds') as HTMLElement).innerText = seconds + ' second' + (seconds === 1 ? '' : 's');
			if (0 === seconds) {
				clearInterval(interval);
				dialog.close();
				history.replaceState(null, '', '#' + location.hash.replace(/^#+/, ''));
				location.href = (document.getElementById('playground-link') as HTMLAnchorElement).href;
			}
		}, 1000);
		let button = document.querySelector('#autoredirect-cancel') as HTMLButtonElement;
		button.addEventListener('click', () => {
			clearInterval(interval);
			dialog.close();
		});
		button.focus();
		button = document.querySelector('#redirect-now') as HTMLButtonElement;
		button.addEventListener('click', () => {
			clearInterval(interval);
			history.replaceState(null, '', '#' + location.hash.replace(/^#+/, ''));
			location.href = (document.getElementById('playground-link') as HTMLAnchorElement).href;
		});
		dialog.addEventListener('click', function (event) {
			if (event.target === this) {
				clearInterval(interval);
				dialog.close();
			}
		});
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && dialog.open) {
				clearInterval(interval);
				document.removeEventListener('keydown', handleEscape);
			}
		};
		document.addEventListener('keydown', handleEscape);
	}
}
