/**
 * Event Handlers Controller
 * Centralizes event handling and delegation for the application
 */

import { StepDefinition, ShowCallbacks } from './types';
import { fixMouseCursor } from './dom-utils';
import { loadAceEditor, getAceTheme, updateAceStatusBar } from './ace-editor';
import { extractStepDataFromElement } from './blueprint-compiler';
import { deleteMyStep, renameMyStep } from './custom-steps';
import { blueprintEventBus } from './blueprint-event-bus';
import { initViewSourceAceEditor } from './ace-editor';
import { StateController } from './state-controller';

export interface EventHandlersControllerDependencies {
	customSteps: Record<string, StepDefinition>;
	showCallbacks: ShowCallbacks;
	stateController: StateController;
	insertStep: (target: EventTarget) => void;
	saveMyStep: () => void;
	loadCombinedExamples: () => void;
	aceEditorRef: { current: any | null };
	linkedTextareaRef: { current: HTMLTextAreaElement | null };
}

export class EventHandlersController {
	private deps: EventHandlersControllerDependencies;

	constructor(deps: EventHandlersControllerDependencies) {
		this.deps = deps;
	}

	/**
	 * Setup all event listeners
	 */
	setupEventListeners(): void {
		document.addEventListener('click', (event) => this.handleClick(event));
	}

	/**
	 * Main click event handler with delegation
	 */
	private handleClick(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		let dialog: HTMLDialogElement | null;

		// Handle clicks within blueprint steps
		if (target.closest('#blueprint-steps')) {
			if (target.tagName === 'BUTTON') {
				// Code editor button
				if (target.classList.contains('code-editor')) {
					this.handleCodeEditorButton(event, target);
					return;
				}

				// Save step button
				if (target.classList.contains('save-step')) {
					this.handleSaveStepButton(event, target);
					return;
				}

				// Add vars button
				if (target.classList.contains('add')) {
					this.handleAddVarsButton(target);
					return;
				}

				// Custom step onclick handlers
				const stepConfig = this.deps.customSteps[(target as any).dataset.stepVar];
				const varConfig = stepConfig?.vars?.find(v => v.name === (target as any).dataset.stepName);
				if (typeof varConfig?.onclick === 'function') {
					return varConfig.onclick(event, this.deps.loadCombinedExamples);
				}
				return;
			}

			// Handle SELECT changes
			if (target.tagName === 'SELECT') {
				blueprintEventBus.emit('blueprint:updated');
				return;
			}

			// Toggle step collapse
			if (target.classList.contains('stepname')) {
				target.closest('.step')?.classList.toggle('collapsed');
				return;
			}
		}

		// Handle LABEL clicks (for checkboxes)
		if (target.tagName === 'LABEL') {
			const input = target.querySelector('input, select') as HTMLInputElement;
			if (input?.type === 'checkbox') {
				blueprintEventBus.emit('blueprint:updated');
			}
			return;
		}

		// Handle INPUT/SELECT/OPTION changes
		if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'OPTION') {
			const inputTarget = target as HTMLInputElement;
			if (inputTarget.type === 'checkbox' || inputTarget.parentElement?.id === 'playground') {
				blueprintEventBus.emit('blueprint:updated');
			}
			return;
		}

		// Handle My Steps actions (delete, rename, share)
		const stepElement = target.closest('.step') as HTMLElement;
		if (target.closest('#step-library') && stepElement?.classList.contains('mine')) {
			if (target.classList.contains('delete')) {
				this.handleDeleteMyStep(stepElement);
				return;
			}
			if (target.classList.contains('rename')) {
				this.handleRenameMyStep(stepElement, target);
				return;
			}
			if (target.classList.contains('share')) {
				this.handleShareMyStep(stepElement, target);
				return;
			}
		}

		// Handle step insertion from library
		if (target.closest('.step') && target.closest('#step-library') && !target.closest('details')) {
			this.deps.insertStep(event.target!);
			return;
		}

		// Handle remove button
		if (target.classList.contains('remove')) {
			target.closest('.step')?.remove();
			blueprintEventBus.emit('blueprint:updated');
			event.preventDefault();
			return;
		}

		// Handle sample value clicks
		if (target.classList.contains('sample')) {
			const td = target.closest('td');
			const input = td?.querySelector('input,textarea') as HTMLInputElement | HTMLTextAreaElement;
			if (input) {
				input.value = target.innerText === '<empty>' ? '' : target.innerText;
				blueprintEventBus.emit('blueprint:updated');
			}
			return;
		}

		// Handle view source links
		if (target.classList.contains('view-source')) {
			event.preventDefault();
			const sourceUrl = (target as HTMLAnchorElement).href;
			initViewSourceAceEditor(sourceUrl);
			return;
		}

		// Handle save step dialog button
		if (target.tagName === 'BUTTON' && target.closest('#save-step')) {
			this.deps.saveMyStep();
			return;
		}

		// Handle view source close button
		if ((target as HTMLElement).id === 'view-source-close') {
			document.body.classList.remove('dialog-open');
			(document.getElementById('view-source') as HTMLDialogElement).close();
			return;
		}

		// Handle code editor close button
		if (target.tagName === 'BUTTON' && target.closest('#code-editor')) {
			if (this.deps.aceEditorRef.current) {
				this.deps.aceEditorRef.current.destroy();
				this.deps.aceEditorRef.current = null;
			}
			(document.getElementById('code-editor') as HTMLDialogElement).close();
			return;
		}
	}

	/**
	 * Handle code editor button click
	 */
	private handleCodeEditorButton(event: MouseEvent, target: HTMLElement): void {
		const dialog = document.getElementById('code-editor') as HTMLDialogElement;
		this.deps.linkedTextareaRef.current = target.closest('.step')!.querySelector('textarea');
		const fieldName = this.deps.linkedTextareaRef.current!.name;
		const stepElement = target.closest('.step') as HTMLElement;
		const stepData = this.deps.customSteps[stepElement.dataset.step!];
		const fieldConfig = stepData.vars?.find(v => v.name === fieldName);
		const language = fieldConfig?.language || 'text';

		const languageMap: Record<string, string> = {
			'php': 'php',
			'markup': 'html',
			'html': 'html',
			'xml': 'xml',
			'css': 'css',
			'javascript': 'javascript',
			'none': 'text',
			'text': 'text'
		};
		const aceMode = languageMap[language] || 'text';

		const editorContainer = document.getElementById('code-editor-container')!;
		editorContainer.textContent = '';

		dialog.showModal();

		loadAceEditor().then(() => {
			if (this.deps.aceEditorRef.current) {
				this.deps.aceEditorRef.current.destroy();
			}

			this.deps.aceEditorRef.current = (window as any).ace.edit(editorContainer, {
				mode: `ace/mode/${aceMode}`,
				theme: getAceTheme(),
				fontSize: 14,
				showPrintMargin: false,
				wrap: true,
				value: this.deps.linkedTextareaRef.current!.value,
				highlightActiveLine: true,
				highlightGutterLine: true
			});

			this.deps.aceEditorRef.current.getSession().on('change', () => {
				this.deps.linkedTextareaRef.current!.value = this.deps.aceEditorRef.current.getValue();
				blueprintEventBus.emit('blueprint:updated');
			});

			const codeEditorStatus = document.getElementById('code-editor-status')!;
			const modeDisplayName: Record<string, string> = {
				'php': 'PHP',
				'html': 'HTML',
				'xml': 'XML',
				'css': 'CSS',
				'javascript': 'JavaScript',
				'text': 'Plain Text'
			};
			const displayName = modeDisplayName[aceMode] || aceMode.toUpperCase();

			const updateCodeEditorStatus = () => {
				updateAceStatusBar(this.deps.aceEditorRef.current, codeEditorStatus, displayName);
			};

			this.deps.aceEditorRef.current.getSession().selection.on('changeCursor', updateCodeEditorStatus);
			this.deps.aceEditorRef.current.getSession().selection.on('changeSelection', updateCodeEditorStatus);
			updateCodeEditorStatus();

			setTimeout(() => {
				this.deps.aceEditorRef.current.resize();
				this.deps.aceEditorRef.current.renderer.updateFull();
				this.deps.aceEditorRef.current.focus();
			}, 0);
		});
	}

	/**
	 * Handle save step button click
	 */
	private handleSaveStepButton(event: MouseEvent, target: HTMLElement): void {
		const dialog = document.getElementById('save-step') as HTMLDialogElement;
		const stepData = extractStepDataFromElement(target.closest('.step') as HTMLElement);
		const myStep = Object.assign({}, this.deps.customSteps[stepData.step]);

		for (let i = 0; i < myStep.vars!.length; i++) {
			if (stepData.vars && myStep.vars![i].name in stepData.vars && stepData.vars[myStep.vars![i].name]) {
				myStep.vars![i].setValue = stepData.vars[myStep.vars![i].name];
			}
		}

		const input = dialog.querySelector('input') as HTMLInputElement;
		input.value = stepData.step + Object.values(stepData.vars || {}).map((value: any) => {
			if (typeof value !== 'string') {
				return '';
			}
			return value.split(/[^a-z0-9]/i).map((word: string) => {
				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}).join('');
		}).join('');

		dialog.dataset.step = JSON.stringify(myStep);
		dialog.showModal();
	}

	/**
	 * Handle add vars button click
	 */
	private handleAddVarsButton(target: HTMLElement): void {
		const table = target.closest('.step')!.querySelector('.vars') as HTMLElement;
		const clone = table.cloneNode(true) as HTMLElement;
		clone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
		clone.querySelectorAll('input,textarea').forEach((input: Element) => {
			if (input instanceof HTMLInputElement) {
				if (input.type === 'text') {
					input.value = '';
				} else if (input.type === 'checkbox') {
					input.checked = false;
				}
			} else if (input instanceof HTMLTextAreaElement) {
				input.value = '';
			}
		});
		table.parentNode!.appendChild(clone);
	}

	/**
	 * Handle delete my step
	 */
	private handleDeleteMyStep(stepElement: HTMLElement): void {
		const name = stepElement.dataset.id!;
		if (name && confirm('Are you sure you want to delete the step ' + name + '?')) {
			stepElement.remove();
			deleteMyStep(name);
			blueprintEventBus.emit('blueprint:updated');
		}
	}

	/**
	 * Handle rename my step
	 */
	private handleRenameMyStep(stepElement: HTMLElement, target: HTMLElement): void {
		const name = stepElement.dataset.id!;
		const newName = prompt('Enter a new name for the step:', name);
		if (newName && name && renameMyStep(name, newName)) {
			stepElement.dataset.id = newName;
			const stepNameEl = stepElement.querySelector('.stepname');
			if (stepNameEl) stepNameEl.textContent = newName;
			blueprintEventBus.emit('blueprint:updated');
		}
	}

	/**
	 * Handle share my step
	 */
	private handleShareMyStep(stepElement: HTMLElement, target: HTMLElement): void {
		const stepData = extractStepDataFromElement(stepElement);
		const jsonData = JSON.stringify(stepData, null, 2);
		navigator.clipboard.writeText(jsonData);
		target.innerText = 'Copied!';
		setTimeout(() => {
			target.innerText = 'Share';
		}, 2000);
	}
}
