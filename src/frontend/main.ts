/**
 * Main application entry point
 *
 * TODO: Continue refactoring to extract remaining functionality into modules:
 * - history-manager.ts (history persistence and management)
 * - blueprint-compiler.ts (blueprint transformation and compilation)
 * - paste-handlers.ts (paste event handling and content detection)
 * - drag-drop.ts (drag and drop functionality)
 * - event-handlers.ts (global event listeners)
 * - playground-integration.ts (playground URL parsing and decompilation)
 * - wizard.ts (wizard interface)
 * - custom-steps.ts (my steps management)
 */
// @ts-nocheck
import PlaygroundStepLibrary from '../index';
import { StepDefinition, ShowCallbacks } from './types';
import {
	minimalEncode,
	shortenUrl,
	expandUrl,
	isDefaultValue,
	encodeStringAsBase64,
	decodeBase64ToString,
	generateLabel
} from './utils';
import {
	loadAceEditor,
	getAceTheme,
	updateAllAceEditorThemes,
	initBlueprintAceEditor,
	initHistoryBlueprintAceEditor,
	cleanupHistoryBlueprintAceEditor,
	initCodeEditorAce,
	initViewSourceAceEditor,
	cleanupAceEditor,
	blueprintAceEditor,
	setBlueprintAceValue
} from './ace-editor';
import { fixMouseCursor, makeParentStepDraggable, makeParentStepUnDraggable } from './dom-utils';
import {
	detectUrlType,
	detectWpAdminUrl,
	detectHtml,
	detectPhp,
	isPlaygroundDomain,
	detectPlaygroundUrl,
	detectPlaygroundQueryApiUrl
} from './url-detection';
import { showCallbacks, isManualEditMode, setBlueprint, setLinkedTextarea } from './app-state';
import {
	getHistory,
	saveHistory,
	addBlueprintToHistory,
	addBlueprintToHistoryWithId,
	deleteBlueprintFromHistory,
	renameBlueprintInHistory,
	getBlueprintFromHistory,
	isBlueprintInHistory,
	type BlueprintHistoryEntry
} from './my-blueprints';
import { parsePlaygroundQueryApi, shouldUseMuPlugin } from './playground-integration';
import { compressState, uncompressState, extractStepDataFromElement, type StepConfig } from './blueprint-compiler';
import { getDragAfterElement } from './drag-drop';
import { getMySteps, saveMyStep as saveMyStepToStorage, deleteMyStep, renameMyStep } from './custom-steps';

declare global {
	interface Window {
		stepCompiler: PlaygroundStepLibrary;
		removeWizardStep: (stepName: string, wizardStep: number) => void;
		removeWizardPlugin: (index: number) => void;
		removeWizardTheme: (index: number) => void;
		goatcounter?: any;
		ace?: any;
	}
}

addEventListener('DOMContentLoaded', function () {
	const compiler = new PlaygroundStepLibrary();
	const customSteps = compiler.getAvailableSteps() as Record<string, StepDefinition>;

	window.stepCompiler = compiler;
	const stepList = document.getElementById('step-library')!;
	const blueprintSteps = document.getElementById('blueprint-steps')!;

	// Note: showCallbacks and isManualEditMode are imported from app-state.ts
	// URL detection functions are imported from url-detection.ts
	// DOM utility functions (fixMouseCursor, etc.) are imported from dom-utils.ts

	// Note: createStep stays in main.ts for now due to tight coupling with showCallbacks closure
	function createStep(name: string, data: StepDefinition): HTMLDivElement {
		const step = document.createElement('div');
		step.dataset.step = data.step;
		step.className = 'step';
		step.tabIndex = 0;
		const div = document.createElement('div');
		div.className = 'header';
		step.appendChild(div);
		const span = document.createElement('span');
		span.className = 'stepname';
		span.innerText = name;
		div.appendChild(span);
		if (data.mine) {
			step.classList.add('mine');
			const options = document.createElement('details');
			options.appendChild(document.createElement('summary'));
			options.className = 'options';
			const del = document.createElement('button');
			del.innerText = 'Delete';
			del.title = 'Delete this step';
			del.className = 'delete';
			options.appendChild(del);
			const rename = document.createElement('button');
			rename.innerText = 'Rename';
			rename.title = 'Rename this step';
			rename.className = 'rename';
			options.appendChild(rename);
			const share = document.createElement('button');
			share.innerText = 'Share';
			share.title = 'Copy a shareable link to this step';
			share.className = 'share';
			options.appendChild(share);
			const gh = document.createElement('a');
			gh.innerText = 'Submit to Github';
			let shareBody = 'I\'d like to submit a step to the WordPress Playground: \n\n';
			shareBody += 'Name: **' + name + '.js**\n\n';
			shareBody += 'I\'d like to submit a step to the WordPress Playground: \n\n```js\n';
			shareBody += 'customSteps.' + name + ' = customSteps.' + data.step + ';\n';
			shareBody += 'customSteps.' + name + '.info = ' + JSON.stringify(data.info, null, 2) + ';\n';
			if (data.multiple) {
				shareBody += 'customSteps.' + name + '.multiple = true;\n';
			}
			shareBody += 'customSteps.' + name + '.vars = ' + JSON.stringify(data.vars, null, 2).replace(/\\n/g, '\\n" + \n"') + ';\n';
			shareBody += '\n```';
			gh.href = 'https://github.com/akirk/playground-step-library/issues/new?body=' + encodeURIComponent(shareBody) + '&title=Add+a+' + encodeURIComponent(name) + '+step';
			gh.className = 'submit-to-gh';
			gh.title = 'Submit this step to GitHub';
			options.appendChild(gh);
			div.appendChild(options);

		} else if (data.builtin) {
			step.classList.add('builtin');
		}

		const viewSource = document.createElement('a');
		viewSource.className = 'view-source';
		viewSource.href = 'steps/' + name + '.ts';
		viewSource.innerText = 'View Source';
		div.appendChild(viewSource);

		const saveStep = document.createElement('button');
		saveStep.className = 'save-step';
		saveStep.innerText = 'Save As Personal Step';
		div.appendChild(saveStep);

		const remove = document.createElement('a');
		remove.className = 'remove';
		remove.href = '';
		remove.innerText = '✕';
		div.appendChild(remove);

		if (data.description) {
			const info = document.createElement('div');
			info.className = 'info';
			info.innerText = data.description;
			step.appendChild(info);
			step.title = data.description;
		}

		const vars = document.createElement('table');
		vars.className = 'vars';
		if (data.count) {
			const tr = document.createElement('tr');
			let td = document.createElement('td');
			td.innerText = 'count';
			tr.appendChild(td);
			td = document.createElement('td');
			const input = document.createElement('input');
			input.type = 'text';
			input.name = 'count';
			input.pattern = '^\\d+$';
			input.value = String(data.count || '');
			td.appendChild(input);
			tr.appendChild(td);
			vars.appendChild(tr);
		}
		step.appendChild(vars);

		if (data.vars) {
			data.vars.filter(function (v) {
				// Skip deprecated variables
				return !v.deprecated;
			}).forEach(function (v, k) {
				if (typeof v.show === 'function') {
					if (typeof showCallbacks[data.step] === 'undefined') {
						showCallbacks[data.step] = {};
					}
					showCallbacks[data.step][v.name] = v.show;
				}

				let input;
				const tr = document.createElement('tr');
				let td = document.createElement('td');

				if (v.type !== 'boolean') {
					td.className = 'label';
					td.innerText = v.name || '';
					tr.appendChild(td);
					td = document.createElement('td');
					td.className = 'field';
				}

				if (v.type === 'boolean') {
					td.colSpan = 2;
					const input = document.createElement('input');
					input.name = v.name;
					input.type = 'checkbox';
					input.checked = v?.samples?.[0] === 'true' || v?.samples?.[0] === true;
					const label = document.createElement('label');
					label.appendChild(input);
					label.appendChild(document.createTextNode(v.description || ''));
					td.appendChild(label);
				} else if (v.type === 'select') {
					const select = document.createElement('select');
					select.name = v.name;
					if ('options' in v && v.options) {
						v.options.forEach(function (option) {
							const optionElement = new Option(option, option, v.samples?.[0] === option, v.samples?.[0] === option);
							select.appendChild(optionElement);
						});
					}
					td.appendChild(select);
				} else if (v.type === 'textarea') {
					input = document.createElement('textarea');
					input.name = v.name;
					input.placeholder = v.description || '';
					if (v.required) {
						input.required = true;
					}
					td.appendChild(input);
					const codeEditorButton = document.createElement('button');
					codeEditorButton.innerText = 'Code Editor';
					codeEditorButton.className = 'code-editor';
					td.appendChild(codeEditorButton);
					if ('samples' in v && v.samples) {
						input.value = v.samples[0] || '';
						if (v.samples.length > 1) {
							const examples = document.createElement('details');
							const summary = document.createElement('summary');
							summary.innerText = 'Examples';
							examples.appendChild(summary);
							const ul = document.createElement('ul');
							examples.appendChild(ul);
							for (let j = 0; j < v.samples.length; j++) {
								if ('' === v.samples[j]) {
									continue;
								}
								const sample = document.createElement('li');
								sample.className = 'sample';
								sample.innerText = v.samples[j];
								ul.appendChild(sample);
							}
							examples.className = 'examples for-textarea';
							td.appendChild(examples);
						}
					}
				} else if (v.type === 'button') {
					const button = document.createElement('button');
					button.textContent = v.label;
					button.name = v.name;
					td.appendChild(button);
					button.dataset.stepName = v.name;
					button.dataset.stepVar = name;
				} else {
					input = document.createElement('input');
					input.name = v.name;
					input.type = v.type ?? 'text';
					input.placeholder = v.description || '';
					if (v.required) {
						input.required = true;
					}
					if (v.regex) {
						input.pattern = v.regex;
					}
					td.appendChild(input);
					if ('samples' in v && v.samples) {
						input.value = v.samples[0] || '';
						if (v.samples.length > 1) {
							const examples = document.createElement('details');
							const summary = document.createElement('summary');
							summary.innerText = 'Examples';
							examples.appendChild(summary);
							const ul = document.createElement('ul');
							examples.appendChild(ul);
							for (let j = 0; j < v.samples.length; j++) {
								const sample = document.createElement('li');
								sample.className = 'sample';
								sample.innerText = '' === v.samples[j] ? '<empty>' : v.samples[j];
								ul.appendChild(sample);
							}
							examples.className = 'examples';
							td.appendChild(examples);
						}
					}
				}
				tr.appendChild(td);
				vars.appendChild(tr);
			});
			if (data.multiple) {
				const add = document.createElement('button');
				add.innerText = 'Add';
				add.className = 'add';
				step.appendChild(add);
			}
			if (data.vars) {
				for (let j = 0; j < data.vars.length; j++) {
					if (typeof data.vars[j].setValue === 'undefined') {
						continue;
					}
					const key = data.vars[j].name;
					if (!Array.isArray(data.vars[j].setValue)) {
						data.vars[j].setValue = [data.vars[j].setValue];
					}
					for (let i = 0; i < data.vars[j].setValue.length; i++) {
						const vars = step.querySelector('.vars');
						const inputs = step.querySelectorAll('[name="' + key + '"]');
						if (typeof inputs[i] === 'undefined') {
							if (vars && vars.parentNode) {
								const clone = vars.cloneNode(true);
								vars.parentNode.appendChild(clone);
								if (clone instanceof Element) {
									clone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
								}
							}
						}
						const value = data.vars[j].setValue[i];
						const input = step.querySelectorAll('[name="' + key + '"]')[i];
						if (input instanceof HTMLInputElement && 'checkbox' === input.type) {
							input.checked = value === 'true' || value === true;
						} else if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
							input.value = String(value);
						}
					}
				}
			}
		}
		step.setAttribute('id', 'step-' + name);
		step.setAttribute('data-id', name);
		step.setAttribute('draggable', true);

		return step;
	}

	function saveMyStep() {
		const myStepNameEl = document.getElementById('my-step-name');
		const saveStepEl = document.getElementById('save-step');

		if (!(myStepNameEl instanceof HTMLInputElement) || !(saveStepEl instanceof HTMLDialogElement)) {
			return;
		}

		const myStepName = myStepNameEl.value;
		const stepData = saveStepEl.dataset.step;
		if (!stepData) return;

		const myStep = JSON.parse(stepData);
		insertMyStep(myStepName, myStep);
		saveMyStepToStorage(myStepName, myStep);
		saveStepEl.close();
		myStepNameEl.value = '';
	}

	function insertMyStep(name: string, data: StepDefinition) {
		data.mine = true;
		let beforeStep: Element | null = null;

		for (const j in stepList.children) {
			if (stepList.children[j].dataset.id > name) {
				beforeStep = stepList.children[j];
				break;
			}
			if (!stepList.children[j].classList.contains('mine')) {
				beforeStep = stepList.querySelector('.step.builtin');
				break;
			}
		}
		const step = createStep(name, data);
		stepList.insertBefore(step, beforeStep);
		step.querySelectorAll('input,textarea').forEach(fixMouseCursor);
	}

	for (const name in customSteps) {
		const data = customSteps[name];
		// Skip deprecated steps
		if (data.deprecated) {
			continue;
		}
		data.step = name;
		const step = createStep(name, data);
		stepList.appendChild(step);
		step.querySelectorAll('input,textarea').forEach(fixMouseCursor);

	}
	// Load custom steps from localStorage (now using getMySteps from custom-steps.ts)
	const mySteps = getMySteps();
	for (const name in mySteps) {
		const data = mySteps[name];
		insertMyStep(name, data);
	}

	document.addEventListener('dragstart', (event) => {
		if (!(event.target instanceof Element)) return;

		if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.target.classList.contains('step')) {
			event.target.classList.add('dragging');
		}
	});

	document.addEventListener('dragend', (event) => {
		if (!(event.target instanceof Element)) return;

		if (event.target.classList.contains('step')) {
			event.target.classList.remove('dragging');
			loadCombinedExamples();
		}
	});

	let blueprintDropZoneActive = false;

	document.body.addEventListener('dragover', (event) => {
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

		if (!blueprintDropZoneActive) {
			blueprintDropZoneActive = true;
			document.body.classList.add('blueprint-drop-active');
		}
	});

	document.body.addEventListener('dragleave', (event) => {
		if (event.target === document.body || (event.relatedTarget instanceof Node && !document.body.contains(event.relatedTarget))) {
			blueprintDropZoneActive = false;
			document.body.classList.remove('blueprint-drop-active');
		}
	});

	document.body.addEventListener('drop', (event) => {
		const files = event.dataTransfer?.files;
		if (!files || files.length === 0) {
			return;
		}

		const isStepDrag = event.dataTransfer?.effectAllowed === 'move';
		if (isStepDrag) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		blueprintDropZoneActive = false;
		document.body.classList.remove('blueprint-drop-active');

		handleBlueprintFileDrop(files[0]);
	});

	async function handleBlueprintFileDrop(file: File) {
		if (!file.name.endsWith('.json')) {
			showMyBlueprintsToast('Please drop a JSON file');
			return;
		}

		try {
			const text = await file.text();
			const data = JSON.parse(text);

			let nativeBlueprint = null;
			let title = 'Imported Blueprint';

			if (data.blueprints && Array.isArray(data.blueprints)) {
				if (data.blueprints.length === 0) {
					showMyBlueprintsToast('No blueprints found in file');
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
				showMyBlueprintsToast('Unrecognized blueprint format');
				return;
			}

			const { BlueprintDecompiler } = await import('../decompiler');
			const decompiler = new BlueprintDecompiler();
			const result = decompiler.decompile(nativeBlueprint);

			if (result.warnings.length > 0) {
				console.warn('Decompiler warnings:', result.warnings);
			}

			const stepConfig = {
				steps: result.steps.map(step => {
					const vars = {};
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

			restoreSteps(stepConfig, title);

			if (result.unmappedSteps.length === 0) {
				showMyBlueprintsToast('Blueprint loaded successfully!');
			} else {
				const stepTypes = result.unmappedSteps.map(s => s.step || 'unknown').filter((v, i, a) => a.indexOf(v) === i);
				const msg = 'Blueprint loaded. Ignored ' + result.unmappedSteps.length + ' step(s): ' + stepTypes.join(', ');
				showMyBlueprintsToast(msg);
				console.warn('Unmapped steps:', result.unmappedSteps);
			}

		} catch (error) {
			console.error('Blueprint import error:', error);
			const message = error instanceof Error ? error.message : String(error);
			showMyBlueprintsToast('Failed to load blueprint: ' + message);
		}
	}

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			const viewSourceDialog = document.getElementById('view-source');
			if (viewSourceDialog instanceof HTMLDialogElement) {
				if (viewSourceDialog.open) {
					document.body.classList.remove('dialog-open');
				}
				viewSourceDialog.close();
			}
		}
	});

	function insertStep(step: Element) {
		const stepElement = step.closest('.step');
		const stepClone = stepElement.cloneNode(true);
		stepClone.removeAttribute('id');
		blueprintSteps.appendChild(stepClone);
		stepClone.classList.remove('dragging');
		stepClone.classList.remove('hidden');
		stepClone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
		loadCombinedExamples();
		stepClone.querySelector('input,textarea')?.focus();

		if (window.goatcounter && stepElement.dataset.step) {
			window.goatcounter.count({
				path: 'step-used/' + stepElement.dataset.step,
				title: 'Step Used: ' + stepElement.dataset.step,
				event: true
			});
		}

		// Hide the mobile step library overlay after adding a step
		const stepLibraryHolder = document.getElementById('step-library-holder');
		if (stepLibraryHolder) {
			stepLibraryHolder.classList.remove('mobile-visible');
		}
	}

	document.addEventListener('keyup', (event) => {
		if (event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}
		if (!(event.target instanceof Element)) return;

		if ((event.target as HTMLElement).id === 'blueprint-compiled') {
			return;
		}
		if (event.key === 'Enter') {
			if (event.target.closest('#save-step')) {
				return saveMyStep();
			}
			if (event.target.closest('#step-library .step')) {
				insertStep(event.target);
				return false;
			}
			if (event.target.closest('#filter')) {
				const stepLibrary = document.getElementById('step-library');
				if (stepLibrary && stepLibrary.querySelectorAll('.step:not(.hidden)').length === 1) {
					const step = stepLibrary.querySelector('.step:not(.hidden)');
					if (step) insertStep(step);
				}
				return false;
			}
			if (event.target.closest('input') && !event.target.closest('.ace_search_form')) {
				loadCombinedExamples();
				const playgroundLink = document.getElementById('playground-link');
				if (playgroundLink instanceof HTMLElement) playgroundLink.click();
				return false;
			}
		}
		if (event.key == 'Escape') {
			const closestInput = event.target.closest('input,textarea');
			if (closestInput instanceof HTMLElement) {
				closestInput.blur();
				return false;
			}
		}
		if (event.target.closest('#step-library .step')) {
			if (event.key === 'Escape') {
				const stepEl = event.target.closest('.step');
				if (stepEl instanceof HTMLElement) stepEl.blur();
			} else if (event.key === 'ArrowDown') {
				const focused = stepList.querySelector('.step:focus');
				let nextStep = focused?.nextElementSibling;
				while (nextStep && nextStep.classList.contains('hidden')) {
					if (!nextStep) {
						break;
					}
					nextStep = nextStep.nextElementSibling;
				}
				if (nextStep instanceof HTMLElement) {
					nextStep.focus();
				}
				return false;
			} else if (event.key === 'ArrowUp') {
				const focused = stepList.querySelector('.step:focus');
				let prevStep = focused?.previousElementSibling;
				while (prevStep && prevStep.classList.contains('hidden')) {
					if (!prevStep) {
						break;
					}
					prevStep = prevStep.previousElementSibling;
				}
				if (prevStep instanceof HTMLElement) {
					prevStep.focus();
				}
				return false;
			}
		}

		if (!event.target.closest('input,textarea')) {
			if (event.key.match(/^[a-z0-9]$/i) && !event.ctrlKey && !event.altKey && !event.metaKey) {
				const filterEl = document.getElementById('filter');
				if (filterEl instanceof HTMLInputElement) {
					filterEl.value = event.key;
					filterEl.focus();
					filterEl.dispatchEvent(new Event('keyup'));
				}
				return;
			} else if (event.key === 'ArrowUp') {
				stepList.querySelector('.step:last-child').focus();
				return;
			} else if (event.key === 'ArrowDown') {
				stepList.querySelector('.step').focus();
				return;
			}
		}

		loadCombinedExamples();
	});
	document.addEventListener('change', (event) => {
		if ( event.target.id === 'mode' || event.target.id === 'preview-mode' || event.target.id === 'exclude-meta' ) {
			loadCombinedExamples();
			return;
		}
		if ( event.target.name === 'blueprint-version' ) {
			transformJson();
			return;
		}
		if (!event.target.closest('#blueprint')) {
			return;
		}
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
			loadCombinedExamples();
			return;
		}
	});
	document.addEventListener('dblclick', (event) => {
		if (!(event.target instanceof Element)) return;

		if (event.target.classList.contains('stepname')) {
			const step = event.target.closest('.step');
			if (step?.parentNode) {
				step.parentNode.childNodes.forEach(function (s: Node) {
					if (s instanceof Element) {
						s.classList.toggle('collapsed');
					}
				});
			}
			return false;
		}
	});
	// makeParentStepDraggable, makeParentStepUnDraggable, and fixMouseCursor are now imported from dom-utils.ts
	document.addEventListener('click', (event) => {
		let dialog;
		if (event.target.closest('#blueprint-steps')) {
			if (event.target.tagName === 'BUTTON') {
				if (event.target.classList.contains('code-editor')) {
					dialog = document.getElementById('code-editor');
					linkedTextarea = event.target.closest('.step').querySelector('textarea');
					const fieldName = linkedTextarea.name;
					const stepElement = event.target.closest('.step');
					const stepData = customSteps[stepElement.dataset.step];
					const fieldConfig = stepData.vars?.find(v => v.name === fieldName);
					const language = fieldConfig?.language || 'text';

					const languageMap = {
						'php': 'php',
						'markup': 'html',
						'html': 'html',
						'xml': 'xml',
						'none': 'text',
						'text': 'text'
					};
					const aceMode = languageMap[language] || 'text';

					const editorContainer = document.getElementById('code-editor-container');
					editorContainer.textContent = '';

					dialog.showModal();

					loadAceEditor().then(() => {
						if (aceEditor) {
							aceEditor.destroy();
						}

						aceEditor = ace.edit(editorContainer, {
							mode: `ace/mode/${aceMode}`,
							theme: getAceTheme(),
							fontSize: 14,
							showPrintMargin: false,
							wrap: true,
							value: linkedTextarea.value,
							highlightActiveLine: true,
							highlightGutterLine: true
						});

						aceEditor.getSession().on('change', () => {
							linkedTextarea.value = aceEditor.getValue();
							loadCombinedExamples();
						});

						const codeEditorStatus = document.getElementById('code-editor-status');
						const modeDisplayName = {
							'php': 'PHP',
							'html': 'HTML',
							'xml': 'XML',
							'text': 'Plain Text'
						}[aceMode] || aceMode.toUpperCase();

						const updateCodeEditorStatus = () => {
							updateAceStatusBar(aceEditor, codeEditorStatus, modeDisplayName);
						};

						aceEditor.getSession().selection.on('changeCursor', updateCodeEditorStatus);
						aceEditor.getSession().selection.on('changeSelection', updateCodeEditorStatus);
						updateCodeEditorStatus();

						setTimeout(() => {
							aceEditor.resize();
							aceEditor.renderer.updateFull();
							aceEditor.focus();
						}, 0);
					});

					return;
				}

				if (event.target.classList.contains('save-step')) {
					dialog = document.getElementById('save-step');
					const stepData = getStepData(event.target.closest('.step'));
					const myStep = Object.assign({}, customSteps[stepData.step]);
					for (let i = 0; i < myStep.vars.length; i++) {
						if (myStep.vars[i].name in stepData.vars && stepData.vars[myStep.vars[i].name]) {
							myStep.vars[i].setValue = stepData.vars[myStep.vars[i].name];
						}
					}
					dialog.querySelector('input').value = stepData.step + Object.values(stepData.vars).map(function (value) {
						if (typeof value !== 'string') {
							return '';
						}
						return value.split(/[^a-z0-9]/i).map(function (word: string) {
							return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
						}).join('');
					}).join('');
					dialog.dataset.step = JSON.stringify(myStep);
					dialog.showModal();
					return;
				}

				if (event.target.classList.contains('add')) {
					const table = event.target.closest('.step').querySelector('.vars');
					const clone = table.cloneNode(true);
					clone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
					clone.querySelectorAll('input,textarea').forEach(function (input: Element) {
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
					table.parentNode.appendChild(clone);
					return;
				}


				const stepConfig = customSteps[event.target.dataset.stepVar];
				const varConfig = stepConfig?.vars?.find(v => v.name === event.target.dataset.stepName);
				if (typeof varConfig?.onclick === 'function') {
					return varConfig.onclick(event, loadCombinedExamples);
				}
				return;
			}
			if (event.target.tagName === 'SELECT') {
				loadCombinedExamples();
				return;
			}

			if (event.target.classList.contains('stepname')) {
				event.target.closest('.step').classList.toggle('collapsed');
				return false;
			}
		}

		if (event.target.tagName === 'LABEL') {
			const input = event.target.querySelector('input, select');
			if (input.type === 'checkbox') {
				loadCombinedExamples();
			}
			return;
		}
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'OPTION') {
			if (event.target.type === 'checkbox' || event.target.parentNode.id === 'playground') {
				loadCombinedExamples();
			}
			return;
		}

		const stepElement = event.target.closest('.step');
		if (event.target.closest('#step-library') && stepElement && stepElement.classList.contains('mine')) {
			if (event.target.classList.contains('delete')) {
				const name = stepElement.dataset.id;
				if (name && confirm('Are you sure you want to delete the step ' + name + '?')) {
					stepElement.remove();
					deleteMyStep(name);
					loadCombinedExamples();
				}
				return false;
			}
			if (event.target.classList.contains('rename')) {
				const name = stepElement.dataset.id;
				const newName = prompt('Enter a new name for the step:', name);
				if (newName && name && renameMyStep(name, newName)) {
					const stepEl = event.target.closest('.step');
					if (stepEl instanceof HTMLElement) {
						stepEl.dataset.id = newName;
						const stepNameEl = stepEl.querySelector('.stepname');
						if (stepNameEl) stepNameEl.textContent = newName;
					}
					loadCombinedExamples();
				}
				return false;
			}
			if (event.target.classList.contains('share')) {
				const data = location.href.replace(/#.*$/, '') + '#' + compressStateFromDOM([getStepData(event.target.closest('.step'))]);
				navigator.clipboard.writeText(data);
				event.target.innerText = 'Copied!';
				setTimeout(function () {
					event.target.innerText = 'Share';
				}, 2000);
				return false;
			}
		}

		if (event.target.closest('.step') && event.target.closest('#step-library') && !event.target.closest('details')) {
			insertStep(event.target);
			return;
		}
		if (event.target.classList.contains('remove')) {
			event.target.closest('.step').remove();
			loadCombinedExamples();
			event.preventDefault();
			return false;
		}
		if (event.target.classList.contains('sample')) {
			event.target.closest('td').querySelector('input,textarea').value = event.target.innerText === '<empty>' ? '' : event.target.innerText;
			loadCombinedExamples();
			return;
		}
		dialog = document.getElementById('view-source');
		if (event.target.classList.contains('view-source')) {
			event.preventDefault();
			const sourceUrl = event.target.href;
			const fileName = sourceUrl.split('/').slice(-1)[0];
			const stepName = fileName.replace(/\.ts$/, '');
			dialog.querySelector('h2').innerText = fileName;

			// Set documentation link
			const docsLink = dialog.querySelector('#view-source-docs');
			const docsUrl = `https://github.com/akirk/playground-step-library/blob/main/docs/steps/${stepName}.md`;
			docsLink.href = docsUrl;
			docsLink.style.display = '';

			// Load Ace editor and fetch the source file
			Promise.all([loadAceEditor(), fetch(sourceUrl)])
				.then(([_, response]) => {
					if (!response.ok) {
						throw new Error('Failed to load source file');
					}
					return response.text();
				})
				.then(sourceCode => {
					// Initialize Ace editor if not already done
					if (!viewSourceAceEditor) {
						viewSourceAceEditor = ace.edit('view-source-editor');
						viewSourceAceEditor.setTheme(getAceTheme());
						viewSourceAceEditor.session.setMode('ace/mode/typescript');
						viewSourceAceEditor.setFontSize(14);
						viewSourceAceEditor.setShowPrintMargin(false);
						viewSourceAceEditor.setReadOnly(true);
						viewSourceAceEditor.session.setUseWrapMode(true);

						const viewSourceStatus = document.getElementById('view-source-status');
						viewSourceStatus.classList.add('active');

						const updateViewSourceStatus = () => {
							updateAceStatusBar(viewSourceAceEditor, viewSourceStatus, 'TypeScript (Read-only)');
						};

						viewSourceAceEditor.getSession().selection.on('changeCursor', updateViewSourceStatus);
						viewSourceAceEditor.getSession().selection.on('changeSelection', updateViewSourceStatus);
					}

					// Set the source code
					viewSourceAceEditor.setValue(sourceCode, -1);

					// Update status bar
					const viewSourceStatus = document.getElementById('view-source-status');
					const updateViewSourceStatus = () => {
						updateAceStatusBar(viewSourceAceEditor, viewSourceStatus, 'TypeScript (Read-only)');
					};
					updateViewSourceStatus();

					document.body.classList.add('dialog-open');
					dialog.showModal();
				})
				.catch(error => {
					console.error('Error loading source:', error);
					alert('Failed to load source file: ' + error.message);
				});
		}

		if (event.target.tagName === 'BUTTON' && event.target.closest('#save-step')) {
			return saveMyStep();
		}
		if (event.target.id === 'view-source-close') {
			document.body.classList.remove('dialog-open');
			return document.getElementById('view-source').close();
		}
		if (event.target.tagName === 'BUTTON' && event.target.closest('#code-editor')) {
			if (aceEditor) {
				aceEditor.destroy();
				aceEditor = null;
			}
			return document.getElementById('code-editor').close();
		}
	});
	blueprintSteps.addEventListener('dragover', (event) => {
		event.preventDefault();
	});

	blueprintSteps.addEventListener('drop', (event) => {
		event.preventDefault();

		const droppedStep = document.querySelector('.dragging');
		if (droppedStep && droppedStep.parentNode === stepList) {
			const stepClone = droppedStep.cloneNode(true);
			blueprintSteps.appendChild(stepClone);
			stepClone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
			stepClone.classList.remove('dragging');
		}
	});

	// Enable reordering of blocks within block area
	blueprintSteps.addEventListener('dragover', (event) => {
		const draggable = document.querySelector('.dragging');
		if (!draggable || draggable.parentNode === stepList) {
			return;
		}
		event.preventDefault();
		const afterElement = getDragAfterElement(blueprintSteps, event.clientY);
		if (afterElement == null) {
			blueprintSteps.appendChild(draggable);
		} else {
			blueprintSteps.insertBefore(draggable, afterElement);
		}
		loadCombinedExamples();
	});

	// Remove block when dragged out
	blueprintSteps.addEventListener('dragleave', (event) => {
		const draggable = document.querySelector('.dragging');
		if (!draggable || draggable.parentNode === stepList) {
			return;
		}
		if (event.relatedTarget === null || !blueprintSteps.contains(event.relatedTarget)) {
			const removedBlock = document.querySelector('.dragging');
			if (removedBlock) {
				removedBlock.remove();
			}
		}
		loadCombinedExamples();
	});

	// detectUrlType is now imported from url-detection.ts

	function addStepFromUrl(url) {
		const urlType = detectUrlType(url);
		if (!urlType) {
			return false;
		}

		const stepType = urlType === 'theme' ? 'installTheme' : 'installPlugin';
		const stepData = customSteps[stepType];

		if (!stepData) {
			return false;
		}

		const draghint = blueprintSteps.querySelector('#draghint');
		if (draghint) {
			draghint.remove();
		}

		const stepElement = createStep(stepType, stepData);
		blueprintSteps.appendChild(stepElement);
		stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

		const urlInput = stepElement.querySelector('input[name="url"]');
		if (urlInput) {
			urlInput.value = url;
		}

		loadCombinedExamples();
		return true;
	}

	// detectWpAdminUrl is now imported from url-detection.ts

	function addLandingPageStep(landingPath) {
		const stepData = customSteps['setLandingPage'];

		if (!stepData) {
			return false;
		}

		const draghint = blueprintSteps.querySelector('#draghint');
		if (draghint) {
			draghint.remove();
		}

		const stepElement = createStep('setLandingPage', stepData);
		blueprintSteps.appendChild(stepElement);
		stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

		const landingPageInput = stepElement.querySelector('input[name="landingPage"]');
		if (landingPageInput) {
			landingPageInput.value = landingPath;
		}

		loadCombinedExamples();
		return true;
	}

	// detectHtml, detectPhp, isPlaygroundDomain, detectPlaygroundUrl, and detectPlaygroundQueryApiUrl
	// are now imported from url-detection.ts
	// parsePlaygroundQueryApi is now imported from playground-integration.ts

	async function handlePlaygroundBlueprint(blueprintData) {
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
				steps: result.steps.map(step => {
					const vars = {};
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

			restoreSteps(stepConfig, 'Playground Blueprint');

			if (result.unmappedSteps.length === 0) {
				showMyBlueprintsToast('Playground blueprint loaded successfully!');
			} else {
				const stepTypes = result.unmappedSteps.map(s => s.step || 'unknown').filter((v, i, a) => a.indexOf(v) === i);
				const msg = 'Playground blueprint loaded. Ignored ' + result.unmappedSteps.length + ' step(s): ' + stepTypes.join(', ');
				showMyBlueprintsToast(msg);
			}

			return true;
		} catch (error) {
			console.error('Error handling playground blueprint:', error);
			showMyBlueprintsToast('Failed to load playground blueprint');
			return false;
		}
	}

	// shouldUseMuPlugin is now imported from playground-integration.ts

	function addPostStepFromHtml(html) {
		const stepData = customSteps['addPost'];

		if (!stepData) {
			return false;
		}

		const draghint = blueprintSteps.querySelector('#draghint');
		if (draghint) {
			draghint.remove();
		}

		const stepElement = createStep('addPost', stepData);
		blueprintSteps.appendChild(stepElement);
		stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

		const contentInput = stepElement.querySelector('textarea[name="content"]');
		if (contentInput) {
			contentInput.value = html;
		}

		const titleInput = stepElement.querySelector('input[name="title"]');
		if (titleInput && !titleInput.value) {
			titleInput.value = 'Pasted Content';
		}

		const typeInput = stepElement.querySelector('input[name="type"]');
		if (typeInput && !typeInput.value) {
			typeInput.value = 'page';
		}

		loadCombinedExamples();
		return true;
	}

	function addStepFromPhp(phpCode) {
		const useMuPlugin = shouldUseMuPlugin(phpCode);
		const stepType = useMuPlugin ? 'muPlugin' : 'runPHP';
		const stepData = customSteps[stepType];

		if (!stepData) {
			return false;
		}

		const draghint = blueprintSteps.querySelector('#draghint');
		if (draghint) {
			draghint.remove();
		}

		const stepElement = createStep(stepType, stepData);
		blueprintSteps.appendChild(stepElement);
		stepElement.querySelectorAll('input,textarea').forEach(fixMouseCursor);

		const codeInput = stepElement.querySelector('textarea[name="code"]');
		if (codeInput) {
			codeInput.value = phpCode;
		}

		if (useMuPlugin) {
			const nameInput = stepElement.querySelector('input[name="name"]');
			if (nameInput && !nameInput.value) {
				nameInput.value = 'pasted-plugin';
			}
		}

		loadCombinedExamples();
		return true;
	}

	window.addEventListener('paste', async (event) => {
		const pastedText = event.clipboardData.getData('text');
		const urls = pastedText.split('\n').map(line => line.trim()).filter(line => line);

		let hasPlaygroundUrl = false;
		let hasPlaygroundQueryApiUrl = false;
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

		if (detectPhp(pastedText)) {
			hasPhp = true;
		}

		if (detectHtml(pastedText)) {
			hasHtml = true;
		}

		if (!hasPlaygroundUrl && !hasPlaygroundQueryApiUrl && !hasUrl && !hasWpAdminUrl && !hasHtml && !hasPhp) {
			return;
		}

		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			if (event.target.id !== 'filter') {
				return;
			}
		}

		let addedAny = false;

		if (hasPlaygroundUrl) {
			for (const url of urls) {
				const blueprintData = detectPlaygroundUrl(url);
				if (blueprintData) {
					if (await handlePlaygroundBlueprint(blueprintData)) {
						addedAny = true;
					}
					break;
				}
			}
		} else if (hasPlaygroundQueryApiUrl) {
			for (const url of urls) {
				const blueprintData = parsePlaygroundQueryApi(url);
				if (blueprintData) {
					if (await handlePlaygroundBlueprint(blueprintData)) {
						addedAny = true;
					}
					break;
				}
			}
		} else if (hasPhp && !hasUrl && !hasWpAdminUrl) {
			if (addStepFromPhp(pastedText)) {
				addedAny = true;
			}
		} else if (hasHtml && !hasUrl && !hasWpAdminUrl) {
			if (addPostStepFromHtml(pastedText)) {
				addedAny = true;
			}
		} else {
			for (const url of urls) {
				const wpAdminPath = detectWpAdminUrl(url);
				if (wpAdminPath) {
					if (addLandingPageStep(wpAdminPath)) {
						addedAny = true;
					}
				} else if (addStepFromUrl(url)) {
					addedAny = true;
				}
			}
		}

		if (addedAny) {
			event.preventDefault();
		}
	});

	// getDragAfterElement is now imported from drag-drop.ts

	document.getElementById('clear').addEventListener('click', function () {
		document.getElementById('title').value = '';
		blueprintSteps.textContent = '';
		const draghint = document.createElement('div');
		draghint.id = 'draghint';
		draghint.textContent = 'Click or drag the steps to add them here.';
		blueprintSteps.appendChild(draghint);
		document.getElementById('examples').value = 'Examples';
		loadCombinedExamples();
	});

	function downloadBlueprint() {
		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'download-blueprint',
				title: 'Download Blueprint',
				event: true
			});
		}
		const blueprintContent = getBlueprintValue();
		let title = document.getElementById('title').value;

		if (!title || !title.trim()) {
			const stepBlocks = blueprintSteps.querySelectorAll('.step');
			const pluginSteps = Array.from(stepBlocks).filter(block => block.dataset.step === 'installPlugin');
			const hasLandingPage = Array.from(stepBlocks).some(block => block.dataset.step === 'setLandingPage');

			if (pluginSteps.length === 1) {
				const pluginSlug = pluginSteps[0].querySelector('[name="pluginData"]')?.value ||
					pluginSteps[0].querySelector('[name="slug"]')?.value ||
					pluginSteps[0].querySelector('[name="url"]')?.value;
				if (pluginSlug && pluginSlug.trim()) {
					const parts = pluginSlug.split('/').filter(p => p.trim());
					const slug = parts[parts.length - 1].replace(/\.zip$/, '');
					title = 'blueprint-' + slug + (hasLandingPage ? '-landingpage' : '');
				}
			}
		}

		if (!title || !title.trim()) {
			title = 'blueprint';
		}

		const filename = title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';
		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(blueprintContent);
		const downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute('download', filename);
		downloadAnchor.click();
	}

	window.addEventListener('popstate', function (event) {
		if (event.state) {
			restoreState(event.state);
		}
	});

	window.addEventListener('hashchange', function () {
		if (location.hash) {
			restoreState(uncompressState(location.hash.replace(/^#+/, '')));
		}
	});

	document.getElementById('filter').addEventListener('keyup', function (event) {
		// convert to a fuzzy search term by allowing any character to be followed by any number of any characters
		const filter = new RegExp(this.value.replace(/(.)/g, '$1.*'), 'i');
		stepList.querySelectorAll('.step').forEach(function (step) {
			if (step.dataset.id.toLowerCase().match(filter)) {
				step.classList.remove('hidden');
			} else {
				step.classList.add('hidden');
			}
		});
		if (event.key === 'ArrowDown') {
			const steps = stepList.querySelectorAll('.step');
			for (let i = 0; i < steps.length; i++) {
				if (!steps[i].classList.contains('hidden')) {
					steps[i].focus();
					break;
				}
			}
			return false;
		}
	});

	document.getElementById('show-builtin').addEventListener('change', function () {
		if (this.checked) {
			stepList.classList.add('show-builtin');
		} else {
			stepList.classList.remove('show-builtin');
		}
	});

	if (document.getElementById('show-builtin').checked) {
		stepList.classList.add('show-builtin');
	} else {
		stepList.classList.remove('show-builtin');
	}

	// Handle title input changes
	document.addEventListener('input', function (e) {
		if ( e.target.id === 'title' ) {
			loadCombinedExamples();
		}
	});

	// compressState and uncompressState are now imported from blueprint-compiler.ts
	// Wrapper function to gather DOM values and call the imported compressState
	function compressStateFromDOM(steps) {
		const titleEl = document.getElementById('title') as HTMLInputElement;
		const autosaveEl = document.getElementById('autosave') as HTMLInputElement;
		const playgroundEl = document.getElementById('playground') as HTMLInputElement;
		const modeEl = document.getElementById('mode') as HTMLSelectElement;
		const previewModeEl = document.getElementById('preview-mode') as HTMLInputElement;
		const excludeMetaEl = document.getElementById('exclude-meta') as HTMLInputElement;

		return compressState(steps, {
			title: titleEl?.value || undefined,
			autosave: autosaveEl?.value || undefined,
			playground: playgroundEl?.value || undefined,
			mode: modeEl?.value || undefined,
			previewMode: previewModeEl?.value || undefined,
			excludeMeta: excludeMetaEl?.checked || undefined
		});
	}
	function updateVariableVisibility(stepBlock) {
		stepBlock.querySelectorAll('input,select,textarea,button').forEach(function (input) {
			if (!input || typeof showCallbacks[stepBlock.dataset.step] === 'undefined' || typeof showCallbacks[stepBlock.dataset.step][input.name] !== 'function') {
				return;
			}
			const tr = input.closest('tr');
			if (showCallbacks[stepBlock.dataset.step][input.name](stepBlock)) {
				tr.style.display = '';
			} else {
				tr.style.display = 'none';
			}
		});
	}
	// getStepData is now extracted to blueprint-compiler.ts as extractStepDataFromElement
	function getStepData(stepBlock) {
		return extractStepDataFromElement(stepBlock);
	}

	let lastCompressedState = '';

	function loadCombinedExamples() {
		const combinedExamples = {};
		if (document.getElementById('title').value) {
			combinedExamples.title = document.getElementById('title').value;
		}
		combinedExamples.landingPage = '/';
		combinedExamples.steps = [];
		const state = [];

		blueprintSteps.querySelectorAll('.step').forEach(function (stepBlock) {
			updateVariableVisibility(stepBlock);
			const step = getStepData(stepBlock);
			state.push(step);
			combinedExamples.steps = combinedExamples.steps.concat(step);
		});

		if (combinedExamples.steps.length > 0) {
			const draghint = document.getElementById('draghint');
			if (draghint) {
				draghint.style.display = 'none';
			}
		} else {
			const draghint = document.getElementById('draghint');
			if (draghint) {
				draghint.style.display = '';
			}
		}

		blueprint = JSON.stringify(combinedExamples, null, 2);

		const currentCompressedState = compressStateFromDOM(state);

		// Only update history and transform JSON if the state has changed
		if (currentCompressedState !== lastCompressedState) {
			lastCompressedState = currentCompressedState;
			history.pushState(state, '', '#' + currentCompressedState);
			transformJson();
		}
	}

	function transformJson() {
		const queries = [];
		let useBlueprintURLParam = false;
		let outputData;
		const useV2 = document.querySelector('input[name="blueprint-version"]:checked')?.value === 'v2';


		// If in manual edit mode, use the manually edited blueprint directly
		if (isManualEditMode) {
			try {
				const manualBlueprint = getBlueprintValue();
				outputData = JSON.parse(manualBlueprint);
			} catch (e) {
				console.error('Invalid JSON in manual edit mode:', e);
				alert('Invalid JSON in blueprint. Please fix syntax errors before launching.');
				return;
			}
		} else {
			let jsonInput = blueprint;

			// Prepare compilation options from UI elements
			const userDefined = {
				'landingPage': '/',
				'features': {}
			};
			if (!document.getElementById('networking').checked) {
				userDefined.features.networking = false;
			}
			if (document.getElementById('wp-cli').checked) {
				userDefined.extraLibraries = ['wp-cli'];
			}
			if ('latest' !== document.getElementById('wp-version').value || 'latest' !== document.getElementById('php-version').value) {
				userDefined.preferredVersions = {
					wp: document.getElementById('wp-version').value,
					php: document.getElementById('php-version').value
				};
			}

			// Use the PlaygroundStepLibrary to compile the blueprint
			const compiler = new PlaygroundStepLibrary();
			const inputData = Object.assign(userDefined, JSON.parse(jsonInput));
			outputData = compiler.compile(inputData, {}, useV2);

			// Extract query params from the compiler
			const extractedQueryParams = compiler.getLastQueryParams();
			for (const key in extractedQueryParams) {
				queries.push(key + '=' + encodeURIComponent(extractedQueryParams[key]));
			}
		}

		// Add metadata indicating compilation by step library (only if there are steps)
		if (outputData.steps && outputData.steps.length > 0 && !document.getElementById('exclude-meta').checked) {
			if (!outputData.meta) {
				outputData.meta = {};
			}
			// Ensure meta has a title (required by schema)
			if (!outputData.meta.title) {
				const titleInput = document.getElementById('title');
				const blueprintTitle = titleInput && titleInput.value ? titleInput.value.trim() : '';
				outputData.meta.title = blueprintTitle || generateLabel();
			}
			outputData.meta.author = 'https://github.com/akirk/playground-step-library';
		}

		// If exclude-meta is checked, remove the meta property entirely
		if (document.getElementById('exclude-meta').checked && outputData.meta) {
			delete outputData.meta;
		}


		if (!isManualEditMode) {
			setBlueprintValue(JSON.stringify(outputData, null, 2));
		}

		if (document.getElementById('autosave').value) {
			queries.push('site-slug=' + encodeURIComponent(document.getElementById('autosave').value.replace(/[^a-z0-9-]/gi, '')));
			queries.push('if-stored-site-missing=prompt');
		}

		switch (document.getElementById('mode').value) {
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
		switch (document.getElementById('storage').value) {
			case 'browser':
				queries.push('storage=browser');
				break;
			case 'device':
				queries.push('storage=device');
				break;
		}
		if (useV2) {
			queries.push('experimental-blueprints-v2-runner=yes');
		}
		const encodingFormat = document.getElementById('encoding-format').value;
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
		const playground = document.getElementById('playground').value;
		const href = (playground.substr(0, 7) === 'http://' ? playground : 'https://' + playground) + '/' + query + hash;
		document.getElementById('playground-link').href = href;


		// Check blueprint size and show warning if needed
		updateBlueprintSizeWarning(href);
		// Handle split view mode
		handleSplitViewMode(href);
	}

	function updateBlueprintSizeWarning(href) {
		const warningElement = document.getElementById('blueprint-size-warning');

		const sizeInBytes = new Blob([href]).size;
		const sizeInKB = (sizeInBytes / 1024).toFixed(1);

		if (sizeInBytes > 8000) {
			// Create summary element
			const summary = document.createElement('summary');

			// Create and append SVG
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('width', '16');
			svg.setAttribute('height', '16');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('fill', 'none');

			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', 'M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z');
			path.setAttribute('stroke', 'currentColor');
			path.setAttribute('stroke-width', '2');
			path.setAttribute('stroke-linecap', 'round');
			path.setAttribute('stroke-linejoin', 'round');

			svg.appendChild(path);
			summary.appendChild(svg);

			// Create warning text
			const warningText = document.createElement('span');
			warningText.className = 'warning-text';
			warningText.textContent = 'Large blueprint detected ';

			const sizeSpan = document.createElement('span');
			sizeSpan.className = 'warning-size';
			sizeSpan.textContent = `(~${sizeInKB} KB)`;

			warningText.appendChild(sizeSpan);
			summary.appendChild(warningText);

			// Create details paragraph
			const p = document.createElement('p');
			p.textContent = 'This blueprint may not work reliably in all browsers or contexts. Consider downloading the blueprint JSON and hosting it externally (e.g., GitHub Gist, your own server), then use the ';

			const code = document.createElement('code');
			code.textContent = 'blueprint-url';
			p.appendChild(code);

			p.appendChild(document.createTextNode(' parameter with the hosted URL for more reliable sharing.'));

			// Clear and append
			warningElement.textContent = '';
			warningElement.appendChild(summary);
			warningElement.appendChild(p);
			warningElement.style.display = 'block';
		} else {
			warningElement.textContent = '';
			warningElement.style.display = 'none';
		}
	}

	function handleSplitViewMode(href) {
		const previewMode = document.getElementById('preview-mode').value;
		const body = document.body;
		const iframe = document.getElementById('playground-iframe');

		// Remove all split view classes
		body.classList.remove('split-view-bottom', 'split-view-right');

		if (previewMode === 'bottom') {
			body.classList.add('split-view-bottom');
			updateIframeSrc(iframe, href);
		} else if (previewMode === 'right') {
			body.classList.add('split-view-right');
			updateIframeSrc(iframe, href);
		} else {
			iframe.src = '';
		}
	}

	function updateIframeSrc(iframe, newSrc) {
		// Always force reload to ensure the blueprint changes are reflected
		iframe.src = '';
		setTimeout(() => {
			iframe.src = newSrc;
		}, 50);
	}

	function migrateState(state) {
		if (!state || !state.steps) {
			return state;
		}

		// Migration rules for variable name changes
		const variableMigrations = {
			'addPage': {
				'postTitle': 'title',
				'postContent': 'content'
			},
			'addPost': {
				'postTitle': 'title',
				'postContent': 'content',
				'postDate': 'date',
				'postType': 'type',
				'postStatus': 'status'
			},
			'addProduct': {
				'productTitle': 'title',
				'productDescription': 'description',
				'productPrice': 'price',
				'productSalePrice': 'salePrice',
				'productSku': 'sku',
				'productStatus': 'status'
			}
			// Add more step migrations here as needed
			// 'stepName': {
			//     'oldVarName': 'newVarName'
			// }
		};

		// Apply migrations to each step
		state.steps = state.steps.map(function (step) {
			if (!step.vars || !variableMigrations[step.step]) {
				return step;
			}

			const migrations = variableMigrations[step.step];
			const migratedVars = {};

			// Copy existing vars and apply migrations
			Object.keys(step.vars).forEach(function (varName) {
				if (migrations[varName]) {
					// Migrate old variable name to new name
					const newVarName = migrations[varName];
					migratedVars[newVarName] = step.vars[varName];
					console.info('Migrated variable "' + varName + '" to "' + newVarName + '" in step "' + step.step + '"');
				} else {
					// Keep existing variable
					migratedVars[varName] = step.vars[varName];
				}
			});

			return {
				...step,
				vars: migratedVars
			};
		});

		return state;
	}

	function restoreState(state) {
		if (!state) {
			return;
		}

		// Apply migrations before restoring
		state = migrateState(state);
		if (state.title) {
			document.getElementById('title').value = state.title;
		}
		if (state.autosave) {
			document.getElementById('autosave').value = state.autosave;
		}
		if (state.playground) {
			document.getElementById('playground').value = state.playground;
		}
		if (state.mode) {
			document.getElementById('mode').value = state.mode;
		}
		if (state.previewMode) {
			document.getElementById('preview-mode').value = state.previewMode;
		}
		if (state.excludeMeta !== undefined) {
			document.getElementById('exclude-meta').checked = state.excludeMeta;
		}
		if (!(state.steps || []).length) {
			return;
		}
		blueprintSteps.innerHTML = '';
		(state.steps || []).forEach(function (step) {
			if (typeof step.step === 'undefined') {
				if (typeof step.title === 'string') {
					document.getElementById('title').value = step.title;
				}
				return;
			}
			let possibleBlocks = stepList.querySelectorAll('[data-step="' + step.step + '"]');
			if (!possibleBlocks.length) {
				return;
			}
			if (possibleBlocks.length > 1) {
				const keys = Object.keys(step.vars || {});
				possibleBlocks = [...possibleBlocks].filter(function (block) {
					for (const key of keys) {
						const vars = Array.isArray(step.vars[key]) ? step.vars[key] : [step.vars[key]];
						const inputs = block.querySelectorAll('[name="' + key + '"]');
						if (inputs.length !== vars.length) {
							return false;
						}
						for (let i = 0; i < inputs.length; i++) {
							const input = inputs[i];
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
					possibleBlocks = [...stepList.querySelectorAll('[data-step="' + step.step + '"]')].filter(function (block) {
						if (block.classList.contains('mine')) {
							return false;
						}
						return true;
					});
				}
			}
			const block = possibleBlocks[0];
			const stepBlock = block.cloneNode(true);
			stepBlock.classList.remove('dragging');
			blueprintSteps.appendChild(stepBlock);
			stepBlock.querySelectorAll('input,textarea').forEach(fixMouseCursor);
			if (step.count) {
				stepBlock.querySelector('[name="count"]').value = step.count;
			}
			Object.keys(step.vars || {}).forEach(function (key) {
				if (key === 'step') {
					return;
				}
				const input = stepBlock.querySelector('[name="' + key + '"]');
				if (!input) {
					console.warn('Step "' + step.step + '" is missing variable "' + key + '" - step definition may have changed');
					return;
				}
				if (Array.isArray(step.vars[key])) {
					step.vars[key].forEach(function (value, index) {
						if (!value) {
							return;
						}
						const inputs = stepBlock.querySelectorAll('[name="' + key + '"]');
						if (typeof inputs[index] === 'undefined') {
							const vars = stepBlock.querySelector('.vars');
							const clone = vars.cloneNode(true);
							vars.parentNode.appendChild(clone);
						}
						const input = stepBlock.querySelectorAll('[name="' + key + '"]')[index];
						if (!input) {
							console.warn('Step "' + step.step + '" is missing variable "' + key + '" at index ' + index + ' - step definition may have changed');
							return;
						}
						if ('checkbox' === input.type) {
							input.checked = value === 'true' || value === true;
						} else {
							input.value = value;
						}
					});
					return;
				}

				if ('checkbox' === input.type) {
					input.checked = step.vars[key] === 'true' || step.vars[key] === true;
				} else {
					input.value = step.vars[key];
				}
			});
		});
		loadCombinedExamples();
	}

	function parseQueryParamsForBlueprint() {
		const urlParams = new URLSearchParams(window.location.search);
		const redirParam = urlParams.get('redir');

		const stepMap = {};
		const paramMap = {};

		for (const [key, value] of urlParams.entries()) {
			if (key === 'redir') {
				continue;
			}

			const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
			if (arrayMatch) {
				const paramName = arrayMatch[1];
				const index = parseInt(arrayMatch[2], 10);

				if (!paramMap[paramName]) {
					paramMap[paramName] = {};
				}
				paramMap[paramName][index] = value;
			}
		}

		if (paramMap.step) {
			const indices = Object.keys(paramMap.step).sort((a, b) => parseInt(a) - parseInt(b));

			const steps = indices.map(index => {
				const stepName = paramMap.step[index];
				const stepVars = {};

				for (const [paramName, values] of Object.entries(paramMap)) {
					if (paramName !== 'step' && values[index] !== undefined) {
						let value = values[index];
						if (paramName === 'url' || paramName.includes('url') || paramName.includes('Url')) {
							value = expandUrl(value);
						}
						stepVars[paramName] = value;
					}
				}

				return {
					step: stepName,
					vars: stepVars
				};
			});

			return {
				steps: steps,
				redir: redirParam ? parseInt(redirParam, 10) : null
			};
		}

		return null;
	}

	function autoredirect(delay = 5) {
		document.getElementById('autoredirecting').showModal();
		document.getElementById('autoredirect-title').textContent = document.getElementById('title').value;
		let seconds = delay;
		document.getElementById('autoredirecting-seconds').innerText = seconds + ' second' + (seconds === 1 ? '' : 's');
		const interval = setInterval(function () {
			seconds--;
			document.getElementById('autoredirecting-seconds').innerText = seconds + ' second' + (seconds === 1 ? '' : 's');
			if (0 === seconds) {
				clearInterval(interval);
				document.getElementById('autoredirecting').close();
				// ensure that the backbutton works to come back here:
				history.replaceState(null, '', '#' + location.hash.replace(/^#+/, ''));
				location.href = document.getElementById('playground-link').href;
			}
		}, 1000);
		let button = document.querySelector('#autoredirect-cancel');
		button.addEventListener('click', function () {
			clearInterval(interval);
			document.getElementById('autoredirecting').close();
		});
		button.focus();
		button = document.querySelector('#redirect-now');
		button.addEventListener('click', function () {
			clearInterval(interval);
			history.replaceState(null, '', '#' + location.hash.replace(/^#+/, ''));
			location.href = document.getElementById('playground-link').href;
		});
		document.getElementById('autoredirecting').addEventListener('click', function (event) {
			if (event.target === this) {
				clearInterval(interval);
				document.getElementById('autoredirecting').close();
			}
		});
		const handleEscape = function (event) {
			if (event.key === 'Escape' && document.getElementById('autoredirecting').open) {
				clearInterval(interval);
				document.removeEventListener('keydown', handleEscape);
			}
		};
		document.addEventListener('keydown', handleEscape);
	}

	// Detect if page was accessed via reload (F5, Ctrl+R, etc.)
	// Use modern Performance Navigation API
	const pageAccessedByReload = (() => {
		try {
			const navigationEntry = performance.getEntriesByType('navigation')[0];
			return navigationEntry && navigationEntry.type === 'reload';
		} catch (e) {
			// Fallback: check if document.referrer is the same as current URL
			// This catches most reload cases across browsers
			return document.referrer === window.location.href;
		}
	})();

	const queryParamBlueprint = parseQueryParamsForBlueprint();
	if (queryParamBlueprint) {
		restoreState({ steps: queryParamBlueprint.steps });
		// Clear step[] and url[] parameters from URL to prevent conflicts with hash state
		const newUrl = new URL(window.location);
		newUrl.search = '';
		history.replaceState(null, '', newUrl.pathname + newUrl.hash);
		if (queryParamBlueprint.redir && !document.getElementById('preview-mode').value && !pageAccessedByReload) {
			autoredirect(queryParamBlueprint.redir);
		}
	} else if (location.hash) {
		restoreState(uncompressState(location.hash.replace(/^#+/, '')));
		if (!document.getElementById('preview-mode').value && blueprintSteps.querySelectorAll('.step').length && !pageAccessedByReload) {
			autoredirect();
		}
	} else {
		loadCombinedExamples();
	}
	const examples = {
		'Interactivity API Todo list MVC': [
			{
				'step': 'addPage',
				'vars': {
					'postTitle': '',
					'postContent': '<!-- wp:to-do-mvc/to-do-mvc /-->',
					'homepage': true
				}
			},
			{
				'step': 'githubPluginRelease',
				'vars': {
					'repo': 'ryanwelcher/interactivity-api-todomvc',
					'release': 'v0.1.3',
					'filename': 'to-do-mvc.zip'
				}
			},
			{
				'step': 'login',
				'vars': {
					'username': 'admin',
					'password': 'password',
					'landingPage': false
				}
			}
		],
		'ActivityPub plugin preview': [
			{
				'step': 'installPlugin',
				'vars': {
					'url': 'activitypub',
					'permalink': true
				}
			},
			{
				'step': 'showAdminNotice',
				'vars': {
					'text': 'Welcome to this demo of the ActivityPub plugin',
					'type': 'info',
					'dismissible': false
				}
			},
			{
				'step': 'setSiteName',
				'vars': {
					'sitename': 'ActivityPub Demo',
					'tagline': 'Trying out WordPress Playground.'
				}
			},
			{
				'step': 'createUser',
				'vars': {
					'username': 'demo',
					'password': 'password',
					'role': 'administrator',
					'display_name': 'Demo User',
					'email': '',
					'login': true
				}
			},
			{
				'step': 'setLandingPage',
				'vars': {
					'landingPage': '/wp-admin/admin.php?page=activitypub'
				}
			}
		],
		'Load Feeds into the Friends plugin': [
			{
				'step': 'setLandingPage',
				'vars': {
					'landingPage': '/friends/'
				}
			},
			{
				'step': 'importFriendFeeds',
				'vars': {
					'opml': 'https://alex.kirk.at Alex Kirk\nhttps://adamadam.blog Adam Zieliński'
				}
			}
		],
		"Show the available PHP extensions + PHPinfo": [
			{
				"step": "addFilter",
				"vars": {
					"filter": "init",
					"code": "$e = get_loaded_extensions(); sort( $e ); echo '<div style=\"float:left; margin-left: 1em\">AvailableExtensions:<ul><li>', implode('</li><li>', $e ), '</li></ul></div>'; phpinfo()",
					"priority": "10"
				}
			}
		]
	};

	Object.keys(examples).forEach(function (example) {
		const option = document.createElement('option');
		option.value = example;
		option.innerText = example;
		document.getElementById('examples').appendChild(option);
	});
	document.getElementById('examples').addEventListener('change', function () {
		if ('Examples' === this.value) {
			return;
		}
		document.getElementById('title').value = this.value;
		restoreState({ steps: examples[this.value] });
		loadCombinedExamples();
	});
	document.getElementById('filter').value = '';

	// Wizard Mode Implementation
	const wizardState = {
		currentStep: 1,
		totalSteps: 4,
		selectedSteps: [],
		selectedPlugins: [],
		selectedThemes: [],
		projectTitle: '',
		projectDescription: '',
		stepConfigurations: {}
	};

	const stepCategories = {
		plugin: ['installPlugin'],
		theme: ['installTheme'],
		content: ['uploadFile', 'writeFile', 'cp', 'mkdir', 'importWxr', 'unzipFile'],
		config: ['defineWpConfigConsts', 'createUser', 'enableMultisite', 'setLandingPage', 'setSiteOptions'],
		advanced: ['runPHP', 'runSQL', 'runShell', 'addFilter', 'importFriendFeeds']
	};

	// Step 2 categories (separate from step 1)
	const step2SelectedSteps = [];

	function initWizard() {
		populateWizardSteps();
		updateWizardProgress();
		setupWizardEventListeners();
	}

	function populateWizardSteps() {
		// Step 1 now uses URL inputs, so we only populate Step 2
		// Populate Step 2: Content, Config, Advanced
		['content', 'config', 'advanced'].forEach(category => {
			const container = document.getElementById(`wizard-${category}-steps`);
			if (!container) return;

			stepCategories[category].forEach(stepName => {
				if (customSteps[stepName]) {
					const card = createWizardStepCard(stepName, customSteps[stepName], 2);
					container.appendChild(card);
				}
			});
		});

		// Initialize plugin and theme lists
		updateWizardPluginList();
		updateWizardThemeList();
	}

	function createWizardStepCard(stepName, stepData, wizardStep) {
		const card = document.createElement('div');
		card.className = 'wizard-step-card';
		card.dataset.step = stepName;
		card.dataset.wizardStep = wizardStep;

		const title = document.createElement('h4');
		title.textContent = stepData.name || stepName;
		card.appendChild(title);

		if (stepData.description) {
			const description = document.createElement('p');
			description.textContent = stepData.description;
			card.appendChild(description);
		}

		card.addEventListener('click', () => toggleWizardStep(stepName, card, wizardStep));

		return card;
	}

	function toggleWizardStep(stepName, card, wizardStep) {
		if (wizardStep === 1) {
			const isSelected = wizardState.selectedSteps.includes(stepName);
			if (isSelected) {
				wizardState.selectedSteps = wizardState.selectedSteps.filter(s => s !== stepName);
				card.classList.remove('selected');
				delete wizardState.stepConfigurations[stepName];
			} else {
				wizardState.selectedSteps.push(stepName);
				card.classList.add('selected');
			}
			updateWizardSelectedList();
		} else if (wizardStep === 2) {
			const isSelected = step2SelectedSteps.includes(stepName);
			if (isSelected) {
				step2SelectedSteps.splice(step2SelectedSteps.indexOf(stepName), 1);
				card.classList.remove('selected');
				delete wizardState.stepConfigurations[stepName];
			} else {
				step2SelectedSteps.push(stepName);
				card.classList.add('selected');
			}
			updateWizardSelectedList2();
		}
	}

	function updateWizardPluginList() {
		const container = document.getElementById('wizard-selected-plugins');
		container.innerHTML = '';

		if (wizardState.selectedPlugins.length === 0) {
			container.innerHTML = '<div class="empty-state">No plugins added yet</div>';
			return;
		}

		wizardState.selectedPlugins.forEach((pluginUrl, index) => {
			const item = document.createElement('div');
			item.className = 'wizard-url-item';

			item.innerHTML = `
				<span class="url-text">${pluginUrl}</span>
				<span class="remove" onclick="removeWizardPlugin(${index})">×</span>
			`;

			container.appendChild(item);
		});
	}

	function updateWizardThemeList() {
		const container = document.getElementById('wizard-selected-themes');
		container.innerHTML = '';

		if (wizardState.selectedThemes.length === 0) {
			container.innerHTML = '<div class="empty-state">No themes added yet</div>';
			return;
		}

		wizardState.selectedThemes.forEach((themeUrl, index) => {
			const item = document.createElement('div');
			item.className = 'wizard-url-item';

			item.innerHTML = `
				<span class="url-text">${themeUrl}</span>
				<span class="remove" onclick="removeWizardTheme(${index})">×</span>
			`;

			container.appendChild(item);
		});
	}

	function addWizardPlugin() {
		const input = document.getElementById('plugin-url-input');
		const url = input.value.trim();

		if (url && !wizardState.selectedPlugins.includes(url)) {
			wizardState.selectedPlugins.push(url);
			input.value = '';
			updateWizardPluginList();
		}
	}

	function addWizardTheme() {
		const input = document.getElementById('theme-url-input');
		const url = input.value.trim();

		if (url && !wizardState.selectedThemes.includes(url)) {
			wizardState.selectedThemes.push(url);
			input.value = '';
			updateWizardThemeList();
		}
	}

	function removeWizardPlugin(index) {
		wizardState.selectedPlugins.splice(index, 1);
		updateWizardPluginList();
	}

	function removeWizardTheme(index) {
		wizardState.selectedThemes.splice(index, 1);
		updateWizardThemeList();
	}

	function updateWizardSelectedList2() {
		const container = document.getElementById('wizard-selected-list-2');
		container.innerHTML = '';

		if (step2SelectedSteps.length === 0) {
			container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No additional features selected</p>';
			return;
		}

		step2SelectedSteps.forEach(stepName => {
			const item = document.createElement('div');
			item.className = 'wizard-selected-item';

			const stepData = customSteps[stepName];
			const name = stepData?.name || stepName;

			item.innerHTML = `
				<span>${name}</span>
				<span class="remove" onclick="removeWizardStep('${stepName}', 2)">×</span>
			`;

			container.appendChild(item);
		});
	}

	function removeWizardStep(stepName, wizardStep) {
		if (wizardStep === 1) {
			wizardState.selectedSteps = wizardState.selectedSteps.filter(s => s !== stepName);
			updateWizardSelectedList();
		} else if (wizardStep === 2) {
			step2SelectedSteps.splice(step2SelectedSteps.indexOf(stepName), 1);
			updateWizardSelectedList2();
		}

		delete wizardState.stepConfigurations[stepName];

		// Update the card visual state
		const card = document.querySelector(`[data-step="${stepName}"][data-wizard-step="${wizardStep}"]`);
		if (card) card.classList.remove('selected');
	}

	function goToWizardStep(stepNumber) {
		// Hide current step
		document.getElementById(`wizard-step-${wizardState.currentStep}`).style.display = 'none';

		// Update current step
		wizardState.currentStep = stepNumber;

		// Show new step
		document.getElementById(`wizard-step-${wizardState.currentStep}`).style.display = 'block';

		// Update progress indicators
		updateWizardProgress();

		// Update navigation
		updateWizardNavigation();

		// Handle step-specific logic
		if (stepNumber === 3) {
			generateStepConfigurations();
		} else if (stepNumber === 4) {
			generateWizardSummary();
		}
	}

	function updateWizardProgress() {
		document.querySelectorAll('.wizard-step-indicator').forEach((indicator, index) => {
			const stepNum = index + 1;
			indicator.classList.remove('active', 'completed');

			if (stepNum < wizardState.currentStep) {
				indicator.classList.add('completed');
			} else if (stepNum === wizardState.currentStep) {
				indicator.classList.add('active');
			}
		});

		document.getElementById('wizard-current-step').textContent = wizardState.currentStep;
	}

	function updateWizardNavigation() {
		const prevBtn = document.getElementById('wizard-prev');
		const nextBtn = document.getElementById('wizard-next');
		const finishBtn = document.getElementById('wizard-finish');

		prevBtn.disabled = wizardState.currentStep === 1;

		if (wizardState.currentStep === wizardState.totalSteps) {
			nextBtn.style.display = 'none';
			finishBtn.style.display = 'inline-flex';
		} else {
			nextBtn.style.display = 'inline-flex';
			finishBtn.style.display = 'none';
		}
	}

	function generateStepConfigurations() {
		const container = document.getElementById('wizard-configuration-area');
		container.innerHTML = '';

		const allSelectedSteps = [...wizardState.selectedSteps, ...step2SelectedSteps];

		if (allSelectedSteps.length === 0) {
			container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No items to configure. All set!</p>';
			return;
		}

		allSelectedSteps.forEach(stepName => {
			const stepData = customSteps[stepName];
			if (!stepData || !stepData.vars) return;

			const configCard = document.createElement('div');
			configCard.className = 'wizard-config-step';

			const title = document.createElement('h4');
			// Use description if available, fallback to stepName for title
			title.textContent = stepData.description || stepName;
			configCard.appendChild(title);

			const form = document.createElement('div');
			form.className = 'wizard-form-group';

			// Handle both array and object formats for vars
			const varsArray = Array.isArray(stepData.vars) ? stepData.vars : Object.entries(stepData.vars).map(([name, config]) => ({ name, ...config }));

			varsArray.forEach(varConfig => {
				const varName = varConfig.name;
				const formGroup = document.createElement('div');
				formGroup.className = 'wizard-form-group';

				const label = document.createElement('label');
				label.textContent = varConfig.description || varConfig.label || varName;
				formGroup.appendChild(label);

				let input;
				if (varConfig.type === 'textarea') {
					input = document.createElement('textarea');
				} else if (varConfig.type === 'select') {
					input = document.createElement('select');
					if (varConfig.options) {
						varConfig.options.forEach(option => {
							const optElement = document.createElement('option');
							optElement.value = option;
							optElement.textContent = option;
							input.appendChild(optElement);
						});
					}
				} else {
					input = document.createElement('input');
					input.type = varConfig.type || 'text';
				}

				input.name = varName;
				input.placeholder = varConfig.placeholder || '';
				input.value = varConfig.default || '';

				if (varConfig.description) {
					const description = document.createElement('small');
					description.textContent = varConfig.description;
					formGroup.appendChild(description);
				}

				formGroup.appendChild(input);
				form.appendChild(formGroup);

				// Store configuration
				if (!wizardState.stepConfigurations[stepName]) {
					wizardState.stepConfigurations[stepName] = {};
				}
				wizardState.stepConfigurations[stepName][varName] = input.value;

				// Update configuration on change
				input.addEventListener('input', () => {
					wizardState.stepConfigurations[stepName][varName] = input.value;
				});
			});

			configCard.appendChild(form);
			container.appendChild(configCard);
		});
	}

	function generateWizardSummary() {
		// Update summary
		const summarySection = document.getElementById('wizard-summary-all');
		let summaryContent = '';

		if (wizardState.selectedPlugins.length > 0) {
			summaryContent += '<p><strong>🔌 Plugins:</strong></p><ul>';
			wizardState.selectedPlugins.forEach(pluginUrl => {
				summaryContent += `<li><code>${pluginUrl}</code></li>`;
			});
			summaryContent += '</ul>';
		}

		if (wizardState.selectedThemes.length > 0) {
			summaryContent += '<p><strong>🎨 Themes:</strong></p><ul>';
			wizardState.selectedThemes.forEach(themeUrl => {
				summaryContent += `<li><code>${themeUrl}</code></li>`;
			});
			summaryContent += '</ul>';
		}

		if (step2SelectedSteps.length > 0) {
			summaryContent += '<p><strong>📁 Additional Features:</strong></p><ul>';
			step2SelectedSteps.forEach(stepName => {
				const stepData = customSteps[stepName];
				summaryContent += `<li>${stepData?.name || stepName}</li>`;
			});
			summaryContent += '</ul>';
		}

		if (wizardState.selectedPlugins.length === 0 && wizardState.selectedThemes.length === 0 && step2SelectedSteps.length === 0) {
			summaryContent = '<p style="color: var(--text-muted); font-style: italic;">A basic WordPress installation with no additional plugins or features.</p>';
		}

		summarySection.innerHTML = summaryContent;

		// Generate and display final blueprint
		const finalBlueprint = generateFinalBlueprint();
		document.getElementById('wizard-final-blueprint').value = JSON.stringify(finalBlueprint, null, 2);
	}

	function generateFinalBlueprint() {
		const blueprint = {
			landingPage: '/wp-admin/',
			steps: []
		};

		if (wizardState.projectTitle) {
			blueprint.meta = {
				title: wizardState.projectTitle
			};
			if (wizardState.projectDescription) {
				blueprint.meta.description = wizardState.projectDescription;
			}
		}

		// Add plugin installations
		wizardState.selectedPlugins.forEach(pluginUrl => {
			blueprint.steps.push({
				step: 'installPlugin',
				vars: {
					url: pluginUrl
				}
			});
		});

		// Add theme installations
		wizardState.selectedThemes.forEach(themeUrl => {
			blueprint.steps.push({
				step: 'installTheme',
				vars: {
					url: themeUrl
				}
			});
		});

		// Add step 2 selections
		step2SelectedSteps.forEach(stepName => {
			const stepConfig = {
				step: stepName
			};

			if (wizardState.stepConfigurations[stepName]) {
				const vars = {};
				Object.keys(wizardState.stepConfigurations[stepName]).forEach(varName => {
					const value = wizardState.stepConfigurations[stepName][varName];
					if (value !== '' && value !== null && value !== undefined) {
						vars[varName] = value;
					}
				});

				if (Object.keys(vars).length > 0) {
					stepConfig.vars = vars;
				}
			}

			blueprint.steps.push(stepConfig);
		});

		return blueprint;
	}

	function setupWizardEventListeners() {
		// Wizard toggle
		document.getElementById('wizard-mode-toggle').addEventListener('click', () => {
			document.getElementById('wizard-container').style.display = 'flex';
			document.body.style.overflow = 'hidden';

			// Focus on plugin input for immediate use
			setTimeout(() => {
				document.getElementById('plugin-url-input').focus();
			}, 100);
		});

		// Prevent form submission in wizard
		document.getElementById('wizard-container').addEventListener('submit', (e) => {
			e.preventDefault();
			e.stopPropagation();
		});

		// Prevent Enter key from submitting forms in wizard
		document.getElementById('wizard-container').addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
				e.preventDefault();
				e.stopPropagation();

				// Handle specific inputs
				if (e.target.id === 'plugin-url-input') {
					addWizardPlugin();
				} else if (e.target.id === 'theme-url-input') {
					addWizardTheme();
				}
			}
		});

		// Close wizard
		document.getElementById('wizard-close').addEventListener('click', () => {
			// Auto-populate steps before closing
			applyWizardToMainInterface();

			document.getElementById('wizard-container').style.display = 'none';
			document.body.style.overflow = '';
		});

		// Navigation buttons
		document.getElementById('wizard-prev').addEventListener('click', () => {
			if (wizardState.currentStep > 1) {
				goToWizardStep(wizardState.currentStep - 1);
			}
		});

		document.getElementById('wizard-next').addEventListener('click', () => {
			// Validate current step before proceeding
			if (validateWizardStep()) {
				if (wizardState.currentStep < wizardState.totalSteps) {
					goToWizardStep(wizardState.currentStep + 1);
				}
			}
		});

		document.getElementById('wizard-finish').addEventListener('click', () => {
			finishWizard();
		});

		// Progress indicator clicks (using event delegation)
		document.getElementById('wizard-progress').addEventListener('click', (e) => {
			const indicator = e.target.closest('.wizard-step-indicator');
			if ( indicator ) {
				const targetStep = parseInt(indicator.dataset.step, 10);
				if (targetStep <= wizardState.currentStep || targetStep === wizardState.currentStep + 1) {
					goToWizardStep(targetStep);
				}
			}
		});

		// Plugin/Theme input handlers
		document.getElementById('add-plugin-btn').addEventListener('click', addWizardPlugin);
		document.getElementById('add-theme-btn').addEventListener('click', addWizardTheme);

		// Additional safety: prevent form submission on these specific inputs
		['plugin-url-input', 'theme-url-input'].forEach(inputId => {
			const input = document.getElementById(inputId);
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					e.stopImmediatePropagation();
					return false;
				}
			});
			input.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					e.stopImmediatePropagation();
					return false;
				}
			});
			input.addEventListener('keyup', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					e.stopImmediatePropagation();
					if (inputId === 'plugin-url-input') {
						addWizardPlugin();
					} else if (inputId === 'theme-url-input') {
						addWizardTheme();
					}
					return false;
				}
			});
		});

		// Form inputs
		document.getElementById('wizard-title').addEventListener('input', (e) => {
			wizardState.projectTitle = e.target.value;
		});
	}

	function validateWizardStep() {
		// All steps are optional - users can proceed without making any selections
		return true;
	}

	function applyWizardToMainInterface() {
		const finalBlueprint = generateFinalBlueprint();

		// Apply the blueprint to the main interface
		document.getElementById('title').value = wizardState.projectTitle || '';

		// Clear current steps
		document.getElementById('blueprint-steps').innerHTML = '<div id="draghint">Click or drag the steps to add them here.</div>';

		// Add wizard steps to main interface
		finalBlueprint.steps.forEach(stepConfig => {
			if (customSteps[stepConfig.step]) {
				const stepElement = createStep(customSteps[stepConfig.step].name || stepConfig.step, customSteps[stepConfig.step]);

				// Apply configurations
				if (stepConfig.vars) {
					Object.keys(stepConfig.vars).forEach(varName => {
						const input = stepElement.querySelector(`[name="${varName}"]`);
						if (input) {
							if (input.type === 'checkbox') {
								input.checked = stepConfig.vars[varName];
							} else {
								input.value = stepConfig.vars[varName];
							}
						}
					});
				}

				document.getElementById('blueprint-steps').appendChild(stepElement);
			}
		});

		// Update the blueprint display
		setBlueprintValue(JSON.stringify(finalBlueprint, null, '\t'));
		loadCombinedExamples();
	}

	function finishWizard() {
		// Apply the wizard selections to the main interface
		applyWizardToMainInterface();

		// Close wizard
		document.getElementById('wizard-container').style.display = 'none';
		document.body.style.overflow = '';

		// Reset wizard state
		resetWizardState();
	}

	function resetWizardState() {
		wizardState.currentStep = 1;
		wizardState.selectedSteps = [];
		wizardState.selectedPlugins = [];
		wizardState.selectedThemes = [];
		step2SelectedSteps.length = 0;
		wizardState.projectTitle = '';
		wizardState.projectDescription = '';
		wizardState.stepConfigurations = {};

		// Reset UI
		document.getElementById('wizard-title').value = '';
		document.getElementById('plugin-url-input').value = '';
		document.getElementById('theme-url-input').value = '';
		document.querySelectorAll('.wizard-step-card').forEach(card => {
			card.classList.remove('selected');
		});
		updateWizardPluginList();
		updateWizardThemeList();
		updateWizardSelectedList2();
		updateWizardProgress();
		updateWizardNavigation();

		// Show first step
		document.querySelectorAll('.wizard-step').forEach((step, index) => {
			step.style.display = index === 0 ? 'block' : 'none';
		});
	}

	// Make wizard functions globally accessible
	window.removeWizardStep = removeWizardStep;
	window.removeWizardPlugin = removeWizardPlugin;
	window.removeWizardTheme = removeWizardTheme;

	// Manual Edit Mode functionality
	const blueprintTextarea = document.getElementById('blueprint-compiled');

	blueprintTextarea.addEventListener('focus', function () {
		initBlueprintAceEditor();
	});

	blueprintTextarea.addEventListener('click', function () {
		initBlueprintAceEditor();
	});

	// Intercept playground link clicks to regenerate URL if in manual edit mode
	document.getElementById('playground-link').addEventListener('click', function (e) {
		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'launch-playground',
				title: 'Launch in Playground',
				event: true
			});
		}

		// Show save prompt only if blueprint hasn't been saved yet
		const blueprintString = getBlueprintValue();
		if (blueprintString && blueprintString.trim() && !isBlueprintAlreadySaved()) {
			showSavePromptToast();
		}

		if (isManualEditMode) {
			e.preventDefault();
			transformJson();
			// Allow the click to proceed after transformJson updates the href
			setTimeout(() => {
				window.open(document.getElementById('playground-link').href, '_blank');
			}, 0);
		}
	});


	function generateRedirectUrl(delay = 1, includeRedir = true) {
		const steps = blueprintSteps.querySelectorAll('.step');

		if (steps.length === 0) {
			return null;
		}

		const params = [];
		if (includeRedir) {
			params.push('redir=' + delay);
		}

		steps.forEach((stepElement, index) => {
			const stepName = stepElement.dataset.step;
			params.push(`step[${index}]=` + stepName);

			const inputs = stepElement.querySelectorAll('input, textarea, select');
			inputs.forEach(input => {
				const varName = input.name;
				if (varName) {
					let value;
					if (input.type === 'checkbox') {
						if (input.checked) {
							value = 'true';
						} else {
							return;
						}
					} else {
						value = input.value;
					}
					if (!isDefaultValue(stepName, varName, value)) {
						let encodedValue = value;
						if (varName === 'url' || varName.includes('url') || varName.includes('Url')) {
							encodedValue = shortenUrl(value);
						}
						encodedValue = minimalEncode(encodedValue);
						params.push(`${varName}[${index}]=` + encodedValue);
					}
				}
			});
		});

		const baseUrl = window.location.origin + window.location.pathname;
		const fullUrl = `${baseUrl}?${params.join('&')}`;
		return fullUrl;
	}

	function initMoreOptionsDropdown(container) {
		const button = container.querySelector('.more-options-button');
		const menu = container.querySelector('.more-options-menu');

		if (!button || !menu) {
			return;
		}

		button.addEventListener('click', function (e) {
			e.stopPropagation();
			const isVisible = menu.style.display === 'block';
			document.querySelectorAll('.more-options-menu').forEach(m => {
				if (m !== menu) {
					m.style.display = 'none';
				}
			});
			menu.style.display = isVisible ? 'none' : 'block';
		});
	}

	document.addEventListener('click', function (e) {
		document.querySelectorAll('.more-options-menu').forEach(menu => {
			const container = menu.closest('.more-options-dropdown');
			const button = container?.querySelector('.more-options-button');
			if (button && !menu.contains(e.target) && !button.contains(e.target)) {
				menu.style.display = 'none';
			}
		});
	});

	const mainDropdown = document.getElementById('more-options-dropdown');
	if (mainDropdown) {
		initMoreOptionsDropdown(mainDropdown);
	}

	const moreOptionsMenu = document.getElementById('more-options-menu');

	document.getElementById('copy-playground-url-menu').addEventListener('click', function (e) {
		const playgroundUrl = document.getElementById('playground-link').href;
		const button = e.currentTarget;
		const originalContent = button.cloneNode(true);
		copyToClipboard(playgroundUrl, button, originalContent);
	});

	document.getElementById('download-blueprint-menu').addEventListener('click', function () {
		moreOptionsMenu.style.display = 'none';
		downloadBlueprint();
	});

	document.getElementById('share-url-menu').addEventListener('click', async function (e) {

		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'share-url',
				title: 'Share URL',
				event: true
			});
		}

		try {
			const shareUrl = generateRedirectUrl(1, false);

			if (!shareUrl) {
				console.error('No steps found');
				return;
			}

			const button = e.currentTarget;
			const originalContent = button.cloneNode(true);
			const title = document.getElementById('title').value || 'WordPress Playground Blueprint';

			if (navigator.share) {
				try {
					await navigator.share({
						title: title,
						url: shareUrl
					});
					moreOptionsMenu.style.display = 'none';
				} catch (err) {
					if (err.name !== 'AbortError') {
						console.error('Share failed, falling back to copy:', err);
						copyToClipboard(shareUrl, button, originalContent);
					}
				}
			} else {
				copyToClipboard(shareUrl, button, originalContent);
			}
		} catch (err) {
			console.error('Error in share-url handler:', err);
		}
	});

	function copyToClipboard(url, button, originalContent) {
		if (!navigator.clipboard) {
			const textarea = document.createElement('textarea');
			textarea.value = url;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			try {
				document.execCommand('copy');
				showCopiedFeedback(button, originalContent);
			} catch (err) {
				console.error('execCommand failed:', err);
			}
			document.body.removeChild(textarea);
		} else {
			navigator.clipboard.writeText(url).then(() => {
				showCopiedFeedback(button, originalContent);
			}).catch(err => {
				console.error('Clipboard write failed:', err);
			});
		}
	}

	function showCopiedFeedback(button, originalContent) {
		button.textContent = '✓ Copied!';
		setTimeout(() => {
			button.textContent = '';
			while (originalContent.firstChild) {
				button.appendChild(originalContent.firstChild);
			}
			moreOptionsMenu.style.display = 'none';
		}, 1500);
	}

	document.getElementById('copy-redirect-url-menu').addEventListener('click', function (e) {

		if (window.goatcounter) {
			window.goatcounter.count({
				path: 'copy-redirect-url',
				title: 'Copy Redirect URL',
				event: true
			});
		}

		try {
			const redirectUrl = generateRedirectUrl();

			if (!redirectUrl) {
				console.error('No steps found');
				return;
			}

			const button = e.currentTarget;
			const originalContent = button.cloneNode(true);
			copyToClipboard(redirectUrl, button, originalContent);
		} catch (err) {
			console.error('Error in copy-redirect-url handler:', err);
		}
	});

	// History functionality
	// getHistory and saveHistory are now imported from my-blueprints.ts
	let currentHistorySelection = null;

	function addToHistory(customTitle) {
		const blueprintString = getBlueprintValue();
		if (!blueprintString) {
			return false;
		}

		let compiledBlueprint;
		try {
			compiledBlueprint = JSON.parse(blueprintString);
		} catch (e) {
			console.error('Failed to parse blueprint:', e);
			return false;
		}

		const stepConfig = captureCurrentSteps();
		const title = customTitle || stepConfig.title || generateLabel();
		delete stepConfig.title;

		const result = addBlueprintToHistory(compiledBlueprint, stepConfig, title);
		updateHistoryButtonVisibility();
		return result;
	}

	function addToHistoryWithId(customTitle) {
		const blueprintString = getBlueprintValue();
		if (!blueprintString) {
			return null;
		}

		let compiledBlueprint;
		try {
			compiledBlueprint = JSON.parse(blueprintString);
		} catch (e) {
			console.error('Failed to parse blueprint:', e);
			return null;
		}

		const stepConfig = captureCurrentSteps();
		const title = customTitle || stepConfig.title || generateLabel();
		delete stepConfig.title;

		const entryId = addBlueprintToHistoryWithId(compiledBlueprint, stepConfig, title);
		updateHistoryButtonVisibility();
		return entryId;
	}

	function saveToHistoryWithName() {
		const compiledBlueprint = getBlueprintValue();
		if (!compiledBlueprint || !compiledBlueprint.trim()) {
			showToast('Cannot save empty blueprint');
			return;
		}

		const titleInput = document.getElementById('title');
		const blueprintTitle = titleInput && titleInput.value ? titleInput.value.trim() : '';

		if (blueprintTitle) {
			const history = getHistory();
			const existingEntry = history.find(entry => entry.title === blueprintTitle);

			if (existingEntry) {
				showSaveBlueprintDialog(blueprintTitle, true);
			} else {
				const success = addToHistory(blueprintTitle);
				if (success) {
					showToast('Saved');
				}
			}
		} else {
			const defaultTitle = generateLabel();
			showSaveBlueprintDialog(defaultTitle, false);
		}
	}

	function showSaveBlueprintDialog(defaultName, isOverwrite) {
		const dialog = document.getElementById('save-blueprint-dialog');
		const messageDiv = document.getElementById('save-blueprint-message');
		const nameInput = document.getElementById('save-blueprint-name');
		const nameLabel = document.getElementById('save-blueprint-label');
		const overwriteBtn = document.getElementById('save-blueprint-overwrite');
		const renameBtn = document.getElementById('save-blueprint-rename');
		const saveBtn = document.getElementById('save-blueprint-save');
		const cancelBtn = document.getElementById('save-blueprint-cancel');

		nameInput.value = defaultName;

		if (isOverwrite) {
			messageDiv.textContent = `A blueprint with this name already exists. Do you want to overwrite it or choose a new name?`;
			messageDiv.style.display = 'block';
			nameLabel.style.display = 'none';
			overwriteBtn.style.display = 'inline-block';
			renameBtn.style.display = 'inline-block';
			saveBtn.style.display = 'none';
		} else {
			messageDiv.textContent = '';
			messageDiv.style.display = 'none';
			nameLabel.style.display = 'block';
			overwriteBtn.style.display = 'none';
			renameBtn.style.display = 'none';
			saveBtn.style.display = 'inline-block';
		}

		const handleOverwrite = function () {
			const title = defaultName;
			const history = getHistory();
			const updatedHistory = history.filter(entry => entry.title !== title);
			saveHistory(updatedHistory);

			const success = addToHistory(title);
			if (success) {
				const titleInput = document.getElementById('title');
				if (titleInput) {
					titleInput.value = title;
				}
				showToast('Updated');
				renderHistoryList();
			}

			dialog.close();
			cleanup();
		};

		const handleRename = function () {
			messageDiv.textContent = '';
			messageDiv.style.display = 'none';
			nameLabel.style.display = 'block';
			overwriteBtn.style.display = 'none';
			renameBtn.style.display = 'none';
			saveBtn.style.display = 'inline-block';
			nameInput.select();
		};

		const handleSave = function () {
			const title = nameInput.value.trim();
			if (!title) {
				return;
			}

			const history = getHistory();
			const existingEntry = history.find(entry => entry.title === title);

			if (existingEntry) {
				showSaveBlueprintDialog(title, true);
				cleanup();
				return;
			}

			const success = addToHistory(title);
			if (success) {
				const titleInput = document.getElementById('title');
				if (titleInput) {
					titleInput.value = title;
				}
				showToast('Saved');
				renderHistoryList();
			}

			dialog.close();
			cleanup();
		};

		const handleCancel = function () {
			dialog.close();
			cleanup();
		};

		const handleKeyDown = function (e) {
			if (e.key === 'Enter' && nameLabel.style.display !== 'none') {
				e.preventDefault();
				handleSave();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				handleCancel();
			}
		};

		const cleanup = function () {
			overwriteBtn.removeEventListener('click', handleOverwrite);
			renameBtn.removeEventListener('click', handleRename);
			saveBtn.removeEventListener('click', handleSave);
			cancelBtn.removeEventListener('click', handleCancel);
			nameInput.removeEventListener('keydown', handleKeyDown);
		};

		overwriteBtn.addEventListener('click', handleOverwrite);
		renameBtn.addEventListener('click', handleRename);
		saveBtn.addEventListener('click', handleSave);
		cancelBtn.addEventListener('click', handleCancel);
		nameInput.addEventListener('keydown', handleKeyDown);

		dialog.showModal();
		if (!isOverwrite) {
			nameInput.select();
		}
	}

	function showToast(message) {
		const toast = document.getElementById('history-toast');
		const toastMessage = document.getElementById('history-toast-message');
		const undoBtn = document.getElementById('history-toast-undo');

		toastMessage.textContent = message;
		undoBtn.style.display = 'none';
		toast.style.display = 'flex';

		if (deleteUndoTimeout) {
			clearTimeout(deleteUndoTimeout);
		}

		deleteUndoTimeout = setTimeout(function () {
			toast.style.display = 'none';
		}, 3000);
	}

	function showMyBlueprintsToast(message: string, undoCallback?: () => void) {
		const toast = document.getElementById('undo-toast');
		const toastMessage = document.getElementById('undo-toast-message');
		const undoBtn = document.getElementById('undo-toast-undo');

		toastMessage.textContent = message;

		if (undoCallback) {
			undoBtn.textContent = 'Undo';
			undoBtn.style.display = 'inline-block';
			undoBtn.onclick = function () {
				clearTimeout(deleteUndoTimeout);
				toast.style.display = 'none';
				undoCallback();
			};
		} else {
			undoBtn.style.display = 'none';
		}

		toast.style.display = 'flex';

		if (deleteUndoTimeout) {
			clearTimeout(deleteUndoTimeout);
		}

		deleteUndoTimeout = setTimeout(function () {
			toast.style.display = 'none';
			lastDeletedEntry = null;
		}, undoCallback ? 5000 : 3000);
	}


	function isBlueprintAlreadySaved() {
		const blueprintString = getBlueprintValue();
		if (!blueprintString || !blueprintString.trim()) {
			return true;
		}

		let compiledBlueprint;
		try {
			compiledBlueprint = JSON.parse(blueprintString);
		} catch (e) {
			return true;
		}

		const history = getHistory();
		if (history.length === 0) {
			return false;
		}

		const lastEntry = history[0];
		const lastBlueprintString = JSON.stringify(lastEntry.compiledBlueprint);
		const currentBlueprintString = JSON.stringify(compiledBlueprint);
		return lastBlueprintString === currentBlueprintString;
	}

	function showSavePromptToast() {
		const toast = document.getElementById('history-toast');
		const toastMessage = document.getElementById('history-toast-message');
		const undoBtn = document.getElementById('history-toast-undo');

		const titleInput = document.getElementById('title');
		const blueprintTitle = titleInput && titleInput.value ? titleInput.value.trim() : '';

		const history = getHistory();
		const existingEntry = blueprintTitle ? history.find(entry => entry.title === blueprintTitle) : null;

		if (existingEntry) {
			toastMessage.textContent = `Update "${blueprintTitle}"?`;
			undoBtn.textContent = 'Update';
		} else if (blueprintTitle) {
			toastMessage.textContent = `Save as "${blueprintTitle}"?`;
			undoBtn.textContent = 'Save';
		} else {
			toastMessage.textContent = 'Save this blueprint?';
			undoBtn.textContent = 'Save';
		}

		undoBtn.style.display = 'inline-block';
		toast.style.display = 'flex';

		undoBtn.onclick = function () {
			hideSavePromptToast();

			if (existingEntry) {
				const updatedHistory = history.filter(entry => entry.title !== blueprintTitle);
				saveHistory(updatedHistory);
				const entryId = addToHistoryWithId(blueprintTitle);
				if (entryId) {
					showToast('Updated');
					renderHistoryList();
				}
			} else if (blueprintTitle) {
				const entryId = addToHistoryWithId(blueprintTitle);
				if (entryId) {
					showToast('Saved');
					renderHistoryList();
				}
			} else {
				const defaultTitle = generateLabel();
				showSaveBlueprintDialog(defaultTitle, false);
			}
		};
	}

	function hideSavePromptToast() {
		const toast = document.getElementById('history-toast');
		toast.style.display = 'none';
		const undoBtn = document.getElementById('history-toast-undo');
		undoBtn.textContent = 'Undo';
	}

	function captureCurrentSteps() {
		const stepsData = {
			steps: []
		};

		document.querySelectorAll('#blueprint-steps .step').forEach(function (stepBlock) {
			const stepData = getStepData(stepBlock);
			if (stepData) {
				stepsData.steps.push(stepData);
			}
		});

		const options = {
			wpVersion: document.getElementById('wp-version').value,
			phpVersion: document.getElementById('php-version').value,
			phpExtensionBundles: document.getElementById('phpExtensionBundles')?.checked || false,
			mode: document.getElementById('mode').value,
			storage: document.getElementById('storage').value,
			autosave: document.getElementById('autosave').value,
			playground: document.getElementById('playground').value,
			encodingFormat: document.getElementById('encoding-format').value,
			previewMode: document.getElementById('preview-mode').value
		};

		const defaults = {
			wpVersion: 'latest',
			phpVersion: 'latest',
			phpExtensionBundles: false,
			mode: 'browser-full-screen',
			storage: 'none',
			autosave: '',
			playground: 'playground.wordpress.net',
			encodingFormat: 'auto',
			previewMode: ''
		};

		const isAllDefaults = Object.keys(options).every(function (key) {
			return options[key] === defaults[key];
		});

		if (!isAllDefaults) {
			stepsData.options = options;
		}

		const titleInput = document.getElementById('title');
		if (titleInput && titleInput.value) {
			stepsData.title = titleInput.value;
		}

		return stepsData;
	}

	function generateLabel() {
		const stepBlocks = document.querySelectorAll('#blueprint-steps .step');
		const stepCount = stepBlocks.length;
		const stepTypes = new Set();
		const plugins = [];
		const themes = [];
		const otherSteps = new Set();

		stepBlocks.forEach(function (block) {
			const stepType = block.dataset.step || block.querySelector('[name="step"]')?.value;
			if (stepType) {
				stepTypes.add(stepType);

				if (stepType === 'installPlugin') {
					const pluginSlug = block.querySelector('[name="pluginData"]')?.value ||
						block.querySelector('[name="slug"]')?.value ||
						block.querySelector('[name="url"]')?.value;
					if (pluginSlug && pluginSlug.trim()) {
						const parts = pluginSlug.split('/').filter(p => p.trim());
						const name = parts[parts.length - 1].replace(/\.zip$/, '').replace(/-/g, ' ');
						plugins.push(name);
					} else {
						otherSteps.add(stepType);
					}
				} else if (stepType === 'installTheme') {
					const themeSlug = block.querySelector('[name="themeData"]')?.value ||
						block.querySelector('[name="slug"]')?.value ||
						block.querySelector('[name="url"]')?.value;
					if (themeSlug && themeSlug.trim()) {
						const parts = themeSlug.split('/').filter(p => p.trim());
						const name = parts[parts.length - 1].replace(/\.zip$/, '').replace(/-/g, ' ');
						themes.push(name);
					} else {
						otherSteps.add(stepType);
					}
				} else {
					otherSteps.add(stepType);
				}
			}
		});

		if (stepTypes.size === 0 || stepCount === 0) {
			return 'Empty Blueprint';
		}

		const parts = [];

		if (plugins.length > 0) {
			const pluginLabel = plugins.length === 1 ? 'Plugin' : 'Plugins';
			const pluginNames = plugins.slice(0, 2).join(', ');
			parts.push(pluginLabel + ' (' + pluginNames + ')');
		}

		if (themes.length > 0) {
			const themeName = themes[0];
			parts.push('Theme (' + themeName + ')');
		}

		if (otherSteps.size > 0) {
			const otherArray = Array.from(otherSteps);
			if (otherArray.length <= 2) {
				parts.push(otherArray.join(', '));
			} else {
				parts.push(otherArray.length + ' more step' + (otherArray.length !== 1 ? 's' : ''));
			}
		}

		if (parts.length > 0) {
			return parts.join(' + ');
		}

		return 'Empty Blueprint';
	}

	function formatDate(isoString) {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) {
			return 'Just now';
		}
		if (diffMins < 60) {
			return diffMins + ' minute' + (diffMins !== 1 ? 's' : '') + ' ago';
		}
		if (diffHours < 24) {
			return diffHours + ' hour' + (diffHours !== 1 ? 's' : '') + ' ago';
		}
		if (diffDays < 7) {
			return diffDays + ' day' + (diffDays !== 1 ? 's' : '') + ' ago';
		}
		return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
	}

	// Save to History button
	document.getElementById('save-to-history-btn').addEventListener('click', function () {
		saveToHistoryWithName();
	});

	// History modal functionality
	const historyModal = document.getElementById('history-modal');
	const historyButton = document.getElementById('history-button');
	const historyClose = document.getElementById('history-close');
	const historyList = document.getElementById('history-list');
	const historyDetailEmpty = document.getElementById('history-detail-empty');
	const historyDetailContent = document.getElementById('history-detail-content');
	const historyBlueprintView = document.getElementById('history-blueprint-view');

	function updateHistoryButtonVisibility() {
		const history = getHistory();
		if (history.length === 0) {
			historyButton.style.display = 'none';
		} else {
			historyButton.style.display = 'flex';
		}
	}

	updateHistoryButtonVisibility();

	historyButton.addEventListener('click', function () {
		renderHistoryList();
		document.body.classList.add('dialog-open');
		historyModal.showModal();
	});

	historyClose.addEventListener('click', function () {
		cleanupHistoryBlueprintAceEditor();
		document.body.classList.remove('dialog-open');
		historyModal.close();
		currentHistorySelection = null;
	});

	historyModal.addEventListener('click', function (e) {
		if (e.target === historyModal) {
			cleanupHistoryBlueprintAceEditor();
			document.body.classList.remove('dialog-open');
			historyModal.close();
			currentHistorySelection = null;
		}
	});

	let lastDeletedEntry = null;
	let deleteUndoTimeout = null;

	function renderHistoryList() {
		const history = getHistory();
		const searchTerm = document.getElementById('history-search').value.toLowerCase();
		historyList.textContent = '';

		const filteredHistory = history.filter(function (entry) {
			if (!searchTerm) {
				return true;
			}
			const titleMatch = entry.title.toLowerCase().includes(searchTerm);
			const blueprintJSON = JSON.stringify(entry.compiledBlueprint).toLowerCase();
			const blueprintMatch = blueprintJSON.includes(searchTerm);
			return titleMatch || blueprintMatch;
		});

		if (history.length === 0) {
			const emptyDiv = document.createElement('div');
			emptyDiv.className = 'history-empty';
			emptyDiv.textContent = 'No saved blueprints yet.';
			historyList.appendChild(emptyDiv);
			return;
		}

		if (filteredHistory.length === 0) {
			const emptyDiv = document.createElement('div');
			emptyDiv.className = 'history-empty';
			emptyDiv.textContent = 'No blueprints match your search.';
			historyList.appendChild(emptyDiv);
			return;
		}

		filteredHistory.forEach(function (entry, index) {
			const entryElement = document.createElement('div');
			entryElement.className = 'history-entry';
			entryElement.dataset.id = entry.id;

			const contentWrapper = document.createElement('div');
			contentWrapper.className = 'history-entry-content';

			const timeElement = document.createElement('div');
			timeElement.className = 'history-entry-time';
			timeElement.textContent = formatDate(entry.date);
			timeElement.title = new Date(entry.date).toLocaleString();

			const labelElement = document.createElement('div');
			labelElement.className = 'history-entry-label';
			labelElement.textContent = entry.title;

			contentWrapper.appendChild(timeElement);
			contentWrapper.appendChild(labelElement);

			const blueprint = entry.compiledBlueprint;

			if (blueprint && blueprint.steps && blueprint.steps.length > 0) {
				const detailsElement = document.createElement('details');
				detailsElement.className = 'history-entry-details';

				const summaryElement = document.createElement('summary');
				summaryElement.textContent = blueprint.steps.length + ' step' + (blueprint.steps.length !== 1 ? 's' : '');
				summaryElement.addEventListener('click', function (e) {
					e.stopPropagation();
				});

				const stepsList = document.createElement('ol');
				stepsList.className = 'history-steps-list';

				blueprint.steps.forEach(function (step) {
					const stepItem = document.createElement('li');
					stepItem.textContent = step.step || 'Unknown step';
					stepsList.appendChild(stepItem);
				});

				detailsElement.appendChild(summaryElement);
				detailsElement.appendChild(stepsList);
				contentWrapper.appendChild(detailsElement);
			}

			const actionsWrapper = document.createElement('div');
			actionsWrapper.className = 'history-entry-actions';

			const renameBtn = document.createElement('button');
			renameBtn.className = 'history-entry-rename';
			renameBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
			renameBtn.title = 'Rename';
			renameBtn.addEventListener('click', function (e) {
				e.stopPropagation();
				renameHistoryEntry(entry.id);
			});

			const deleteBtn = document.createElement('button');
			deleteBtn.className = 'history-entry-delete';
			deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.1709 4C9.58273 2.83481 10.694 2 12.0002 2C13.3064 2 14.4177 2.83481 14.8295 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M20.5001 6H3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9.5 11L10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M14.5 11L14 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
			deleteBtn.title = 'Delete';
			deleteBtn.addEventListener('click', function (e) {
				e.stopPropagation();
				deleteHistoryEntry(entry.id);
			});

			actionsWrapper.appendChild(renameBtn);
			actionsWrapper.appendChild(deleteBtn);

			entryElement.appendChild(contentWrapper);
			entryElement.appendChild(actionsWrapper);

			contentWrapper.addEventListener('click', function (e) {
				if (!e.target.closest('details') && !e.target.closest('summary')) {
					selectHistoryEntry(entry.id);
				}
			});

			contentWrapper.addEventListener('dblclick', function () {
				renameHistoryEntry(entry.id);
			});

			historyList.appendChild(entryElement);

			if (index === 0 && !currentHistorySelection && window.innerWidth > 768) {
				selectHistoryEntry(entry.id);
			}
		});
	}

	function renameHistoryEntry(entryId) {
		const history = getHistory();
		const entry = history.find(function (e) {
			return e.id === entryId;
		});

		if (!entry) {
			return;
		}

		const newTitle = prompt('Enter new name:', entry.title);

		if (newTitle === null || newTitle.trim() === '') {
			return;
		}

		entry.title = newTitle.trim();
		saveHistory(history);
		renderHistoryList();

		if (currentHistorySelection && currentHistorySelection.id === entryId) {
			currentHistorySelection.title = newTitle.trim();
		}

		showMyBlueprintsToast('Renamed to "' + newTitle.trim() + '"');
	}

	function deleteHistoryEntry(entryId) {
		const history = getHistory();
		const entry = history.find(function (e) {
			return e.id === entryId;
		});

		if (!entry) {
			return;
		}

		lastDeletedEntry = entry;

		const filtered = history.filter(function (e) {
			return e.id !== entryId;
		});
		saveHistory(filtered);
		updateHistoryButtonVisibility();

		if (currentHistorySelection && currentHistorySelection.id === entryId) {
			currentHistorySelection = null;
			historyDetailEmpty.style.display = 'block';
			historyDetailContent.style.display = 'none';
		}

		renderHistoryList();

		showMyBlueprintsToast('Deleted "' + entry.title + '"', function () {
			undoDelete();
		});
	}

	function undoDelete() {
		if (!lastDeletedEntry) {
			return;
		}

		const history = getHistory();
		history.push(lastDeletedEntry);
		history.sort(function (a, b) {
			return new Date(b.date) - new Date(a.date);
		});
		saveHistory(history);
		updateHistoryButtonVisibility();

		lastDeletedEntry = null;
		renderHistoryList();
		showMyBlueprintsToast('Restored');
	}

	function selectHistoryEntry(entryId) {
		const history = getHistory();
		const entry = history.find(function (e) {
			return e.id === entryId;
		});

		if (!entry) {
			return;
		}

		currentHistorySelection = entry;

		document.querySelectorAll('.history-entry').forEach(function (el) {
			el.classList.remove('selected');
		});
		document.querySelector('.history-entry[data-id="' + entryId + '"]').classList.add('selected');

		historyDetailEmpty.style.display = 'none';
		historyDetailContent.style.display = 'block';

		const blueprintString = JSON.stringify(entry.compiledBlueprint, null, 2);
		historyBlueprintView.value = blueprintString;

		if (historyBlueprintAceEditor) {
			historyBlueprintAceEditor.setValue(blueprintString, -1);
			historyBlueprintAceEditor.resize();
		} else {
			initHistoryBlueprintAceEditor();
		}

		if (window.innerWidth <= 768) {
			document.getElementById('history-detail-column').classList.add('mobile-visible');
		}
	}

	const historyDetailColumn = document.getElementById('history-detail-column');
	const historyMobileBackBtn = document.getElementById('history-mobile-back-btn');

	historyMobileBackBtn.addEventListener('click', function () {
		historyDetailColumn.classList.remove('mobile-visible');
	});

	const historyDropdown = document.getElementById('history-more-options-dropdown');
	if (historyDropdown) {
		initMoreOptionsDropdown(historyDropdown);
	}

	function getHistoryPlaygroundUrl() {
		if (!currentHistorySelection) {
			return null;
		}
		const playground = document.getElementById('playground').value;
		const blueprintString = JSON.stringify(currentHistorySelection.compiledBlueprint);
		return (playground.substr(0, 7) === 'http://' ? playground : 'https://' + playground) + '/?blueprint-url=data:application/json;base64,' + encodeURIComponent(encodeStringAsBase64(blueprintString));
	}

	document.getElementById('history-copy-playground-url-btn').addEventListener('click', function (e) {
		if (!currentHistorySelection) {
			return;
		}
		const playgroundUrl = getHistoryPlaygroundUrl();
		const button = e.currentTarget;
		const originalContent = button.cloneNode(true);
		copyToClipboard(playgroundUrl, button, originalContent);
	});

	document.getElementById('history-copy-blueprint-btn').addEventListener('click', function () {
		if (!currentHistorySelection) {
			return;
		}
		const blueprintString = JSON.stringify(currentHistorySelection.compiledBlueprint, null, 2);
		navigator.clipboard.writeText(blueprintString).then(function () {
			const btn = document.getElementById('history-copy-blueprint-btn');
			const originalText = btn.innerHTML;
			btn.textContent = '✓ Copied!';
			setTimeout(function () {
				btn.innerHTML = originalText;
			}, 2000);
		});
	});

	document.getElementById('history-download-blueprint-btn').addEventListener('click', function () {
		if (!currentHistorySelection) {
			return;
		}

		const blueprintString = JSON.stringify(currentHistorySelection.compiledBlueprint, null, 2);
		const filename = currentHistorySelection.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';
		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(blueprintString);
		const downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute('download', filename);
		downloadAnchor.click();

		showMyBlueprintsToast('Downloaded');
	});

	document.getElementById('history-share-url-btn').addEventListener('click', async function (e) {
		if (!currentHistorySelection) {
			return;
		}

		const baseUrl = window.location.origin + window.location.pathname;
		const compiledSteps = currentHistorySelection.compiledBlueprint.steps || [];

		const params = [];
		compiledSteps.forEach((step, index) => {
			params.push(`step[${index}]=` + step.step);
			Object.keys(step).forEach(key => {
				if (key !== 'step') {
					params.push(`${key}[${index}]=` + encodeURIComponent(JSON.stringify(step[key])));
				}
			});
		});

		const shareUrl = `${baseUrl}?${params.join('&')}`;
		const button = e.currentTarget;
		const originalContent = button.cloneNode(true);
		const title = currentHistorySelection.title || 'WordPress Playground Blueprint';

		if (navigator.share) {
			try {
				await navigator.share({
					title: title,
					url: shareUrl
				});
			} catch (err) {
				if (err.name !== 'AbortError') {
					copyToClipboard(shareUrl, button, originalContent);
				}
			}
		} else {
			copyToClipboard(shareUrl, button, originalContent);
		}
	});

	document.getElementById('history-copy-redirect-url-btn').addEventListener('click', function (e) {
		if (!currentHistorySelection) {
			return;
		}

		const baseUrl = window.location.origin + window.location.pathname;
		const compiledSteps = currentHistorySelection.compiledBlueprint.steps || [];

		const params = ['redir=1'];
		compiledSteps.forEach((step, index) => {
			params.push(`step[${index}]=` + step.step);
			Object.keys(step).forEach(key => {
				if (key !== 'step') {
					params.push(`${key}[${index}]=` + encodeURIComponent(JSON.stringify(step[key])));
				}
			});
		});

		const redirectUrl = `${baseUrl}?${params.join('&')}`;
		const button = e.currentTarget;
		const originalContent = button.cloneNode(true);
		copyToClipboard(redirectUrl, button, originalContent);
	});

	document.getElementById('history-launch-btn').addEventListener('click', function () {
		if (!currentHistorySelection) {
			return;
		}

		const playground = document.getElementById('playground').value;
		const blueprintString = JSON.stringify(currentHistorySelection.compiledBlueprint);
		const href = (playground.substr(0, 7) === 'http://' ? playground : 'https://' + playground) + '/?blueprint-url=data:application/json;base64,' + encodeURIComponent(encodeStringAsBase64(blueprintString));

		window.open(href, '_blank');
	});

	document.getElementById('history-restore-btn').addEventListener('click', function () {
		if (!currentHistorySelection) {
			return;
		}
		restoreSteps(currentHistorySelection.stepConfig, currentHistorySelection.title);

		cleanupHistoryBlueprintAceEditor();
		document.body.classList.remove('dialog-open');
		historyModal.close();
	});

	document.getElementById('history-mobile-delete-btn').addEventListener('click', function () {
		if (!currentHistorySelection) {
			return;
		}
		const entryId = currentHistorySelection.id;
		historyDetailColumn.classList.remove('mobile-visible');
		setTimeout(function () {
			deleteHistoryEntry(entryId);
		}, 300);
	});

	document.getElementById('history-save-current-btn').addEventListener('click', function () {
		saveToHistoryWithName();
		renderHistoryList();
	});

	document.getElementById('history-export-all-btn').addEventListener('click', function () {
		exportAllBlueprints();
	});

	document.getElementById('history-import-btn').addEventListener('click', function () {
		document.getElementById('history-import-file').click();
	});

	document.getElementById('history-import-file').addEventListener('change', function (e) {
		const file = e.target.files[0];
		if (file) {
			importBlueprints(file);
		}
		e.target.value = '';
	});


	// History search
	document.getElementById('history-search').addEventListener('input', function () {
		renderHistoryList();
	});

	// Toast close button
	document.getElementById('history-toast-close').addEventListener('click', function () {
		hideSavePromptToast();
	});

	// Undo toast close button
	document.getElementById('undo-toast-close').addEventListener('click', function () {
		const toast = document.getElementById('undo-toast');
		toast.style.display = 'none';
		if (deleteUndoTimeout) {
			clearTimeout(deleteUndoTimeout);
		}
	});

	function exportAllBlueprints() {
		const history = getHistory();
		if (history.length === 0) {
			showMyBlueprintsToast('No blueprints to export');
			return;
		}

		const now = new Date();
		const blueprintsForExport = history.map(function (entry) {
			return {
				title: entry.title,
				date: entry.date,
				compiledBlueprint: entry.compiledBlueprint,
				stepConfig: entry.stepConfig
			};
		});

		const exportData = {
			version: 1,
			exportDate: now.toISOString(),
			blueprints: blueprintsForExport
		};

		const dateStr = now.toISOString().split('T')[0];
		const filename = 'blueprints-' + dateStr + '.json';

		const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
		const downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute('href', dataStr);
		downloadAnchor.setAttribute('download', filename);
		downloadAnchor.click();

		showMyBlueprintsToast('Exported ' + history.length + ' blueprint' + (history.length === 1 ? '' : 's'));
	}

	function importBlueprints(file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			try {
				const importData = JSON.parse(e.target.result);
				let blueprintsToImport = [];

				if (Array.isArray(importData)) {
					blueprintsToImport = importData;
				} else if (importData.blueprints && Array.isArray(importData.blueprints)) {
					blueprintsToImport = importData.blueprints;
				} else if (importData.stepConfig && importData.compiledBlueprint) {
					blueprintsToImport = [importData];
				} else {
					showMyBlueprintsToast('Invalid file format');
					return;
				}

				const history = getHistory();
				let importedCount = 0;
				let skippedCount = 0;

				blueprintsToImport.forEach(function (blueprint) {
					if (!blueprint.compiledBlueprint || !blueprint.stepConfig) {
						skippedCount++;
						return;
					}

					const blueprintStr = JSON.stringify(blueprint.compiledBlueprint);
					const isDuplicate = history.some(function (existingEntry) {
						return JSON.stringify(existingEntry.compiledBlueprint) === blueprintStr &&
							existingEntry.date === blueprint.date;
					});

					if (isDuplicate) {
						skippedCount++;
						return;
					}

					const entry = {
						id: Date.now() + importedCount,
						date: blueprint.date || new Date().toISOString(),
						title: blueprint.title || 'Imported Blueprint',
						compiledBlueprint: blueprint.compiledBlueprint,
						stepConfig: blueprint.stepConfig
					};

					history.unshift(entry);
					importedCount++;
				});

				if (history.length > MAX_HISTORY_ENTRIES) {
					history.splice(MAX_HISTORY_ENTRIES);
				}

				saveHistory(history);
				renderHistoryList();
				updateHistoryButtonVisibility();

				let message = 'Imported ' + importedCount + ' blueprint' + (importedCount === 1 ? '' : 's');
				if (skippedCount > 0) {
					message += ' (' + skippedCount + ' skipped)';
				}
				showMyBlueprintsToast(message);

			} catch (error) {
				console.error('Import error:', error);
				showMyBlueprintsToast('Failed to import: Invalid JSON');
			}
		};
		reader.readAsText(file);
	}

	function restoreSteps(stepsData, title) {
		if (!stepsData || !stepsData.steps) {
			return;
		}

		isManualEditMode = false;
		const manualEditBanner = document.getElementById('manual-edit-banner');
		if (manualEditBanner) {
			manualEditBanner.style.display = 'none';
		}

		const blueprintStepsContainer = document.getElementById('blueprint-steps');
		blueprintStepsContainer.textContent = '';
		const draghint = document.createElement('div');
		draghint.id = 'draghint';
		draghint.textContent = 'Click or drag the steps to add them here.';
		blueprintStepsContainer.appendChild(draghint);

		if (title) {
			document.getElementById('title').value = title;
		}

		const missingSteps = [];

		stepsData.steps.forEach(function (stepData) {
			const sourceStep = document.querySelector('#step-library .step[data-step="' + stepData.step + '"]');
			if (!sourceStep) {
				console.warn('Step not found in library:', stepData.step);
				missingSteps.push(stepData.step);
				return;
			}

			const stepBlock = sourceStep.cloneNode(true);
			stepBlock.removeAttribute('id');
			stepBlock.classList.remove('dragging');
			stepBlock.classList.remove('hidden');
			document.getElementById('blueprint-steps').appendChild(stepBlock);

			// Restore vars
			if (stepData.vars) {
				for (const key in stepData.vars) {
					const input = stepBlock.querySelector('[name="' + key + '"]');
					if (input) {
						if (input.type === 'checkbox') {
							input.checked = stepData.vars[key];
						} else {
							input.value = stepData.vars[key];
						}
					}
				}
			}

			// Restore count if present
			if (stepData.count) {
				const countInput = stepBlock.querySelector('[name="count"]');
				if (countInput) {
					countInput.value = stepData.count;
				}
			}
		});

		if (missingSteps.length > 0) {
			showMyBlueprintsToast('Warning: ' + missingSteps.length + ' step(s) not found: ' + missingSteps.join(', '));
		}

		if (stepsData.options) {
			const opts = stepsData.options;
			if (opts.wpVersion) {
				document.getElementById('wp-version').value = opts.wpVersion;
			}
			if (opts.phpVersion) {
				document.getElementById('php-version').value = opts.phpVersion;
			}
			if (opts.phpExtensionBundles !== undefined) {
				document.getElementById('phpExtensionBundles').checked = opts.phpExtensionBundles;
			}
			if (opts.mode) {
				document.getElementById('mode').value = opts.mode;
			}
			if (opts.storage) {
				document.getElementById('storage').value = opts.storage;
			}
			if (opts.autosave) {
				document.getElementById('autosave').value = opts.autosave;
			}
			if (opts.playground) {
				document.getElementById('playground').value = opts.playground;
			}
			if (opts.encodingFormat) {
				document.getElementById('encoding-format').value = opts.encodingFormat;
			} else if (opts.base64 !== undefined) {
				document.getElementById('encoding-format').value = opts.base64 ? 'base64' : 'auto';
			}
			if (opts.previewMode) {
				document.getElementById('preview-mode').value = opts.previewMode;
			}
		}

		loadCombinedExamples();
	}

	// Initialize wizard
	initWizard();

	// Initialize empty blueprint if no steps are present
	if (blueprintSteps.querySelectorAll('.step').length === 0) {
		setBlueprintValue(JSON.stringify({}, null, 2));
	}
});
