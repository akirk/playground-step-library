import PlaygroundStepLibrary from './lib/src/index.js';

addEventListener('DOMContentLoaded', function () {
	// Create an instance to get available steps
	const compiler = new PlaygroundStepLibrary();
	const customSteps = compiler.getAvailableSteps();
	
	// Make compiler accessible for step functions
	window.stepCompiler = compiler;
	const stepList = document.getElementById('step-library');
	const blueprintSteps = document.getElementById('blueprint-steps');
	let blueprint = '';
	let linkedTextarea = null;
	const showCallbacks = {};

	function createStep(name, data) {
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
		if (data.description) {
			const info = document.createElement('div');
			info.className = 'info';
			info.innerText = data.description;
			span.appendChild(info);
			step.title = data.description;
		}
		if (data.mine) {
			step.classList.add('mine');
			const options = document.createElement('details');
			options.appendChild(document.createElement('summary'));
			options.className = 'options';
			const del = document.createElement('button');
			del.innerText = 'Delete';
			del.title = 'Delete this step';
			del.href = '';
			del.className = 'delete';
			options.appendChild(del);
			const rename = document.createElement('button');
			rename.innerText = 'Rename';
			rename.title = 'Rename this step';
			rename.href = '';
			rename.className = 'rename';
			options.appendChild(rename);
			const share = document.createElement('button');
			share.innerText = 'Share';
			share.title = 'Copy a shareable link to this step';
			share.href = '';
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
		if (data.builtin) {
			viewSource.href = 'steps/builtin/' + name + '.js';
		} else {
			viewSource.href = 'steps/' + name + '.js';
		}
		viewSource.innerText = 'View Source';
		viewSource.target = 'source-iframe';
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
			input.value = data.count;
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
				td.innerText = v.name || '';
				tr.appendChild(td);

				td = document.createElement('td');
				if (v.type === 'boolean') {
					const input = document.createElement('input');
					input.name = v.name;
					input.type = 'checkbox';
					input.checked = v?.samples?.[0] === 'true' || v?.samples?.[0] === true;
					const label = document.createElement('label');
					label.appendChild(input);
					label.appendChild(document.createTextNode(v.description));
					td.appendChild(label);
				} else if (v.type === 'select') {
					const select = document.createElement('select');
					select.name = v.name;
					if ('options' in v) {
						v.options.forEach(function (option) {
							const optionElement = new Option(option, option, v.samples?.[0] === option, v.samples?.[0] === option);
							select.appendChild(optionElement);
						});
					}
					td.appendChild(select);
				} else if (v.type === 'textarea') {
					input = document.createElement('textarea');
					input.name = v.name;
					input.placeholder = v.description;
					if (v.required) {
						input.required = true;
					}
					td.appendChild(input);
					if ('samples' in v) {
						input.value = v.samples[0];
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
					const codeEditorButton = document.createElement('button');
					codeEditorButton.innerText = 'Code Editor';
					codeEditorButton.className = 'code-editor';
					td.appendChild(codeEditorButton);
				} else if (v.type === 'button') {
					const button = document.createElement('button');
					button.textContent = v.label;
					td.appendChild(button);
					button.dataset.stepName = k;
					button.dataset.stepVar = name;
				} else {
					input = document.createElement('input');
					input.name = v.name;
					input.type = v.type ?? 'text';
					input.placeholder = v.description;
					if (v.required) {
						input.required = true;
					}
					if (v.regex) {
						input.pattern = v.regex;
					}
					td.appendChild(input);
					if ('samples' in v) {
						input.value = v.samples[0];
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
							const clone = vars.cloneNode(true);
							vars.parentNode.appendChild(clone);
							clone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
						}
						const value = data.vars[j].setValue[i];
						const input = step.querySelectorAll('[name="' + key + '"]')[i];
						if ('checkbox' === input.type) {
							input.checked = value === 'true' || value === true;
						} else {
							input.value = value;
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
		const myStepName = document.getElementById('my-step-name').value;
		const myStep = JSON.parse(document.getElementById('save-step').dataset.step);
		insertMyStep(myStepName, myStep);
		mySteps[myStepName] = myStep;
		localStorage.setItem('mySteps', JSON.stringify(mySteps));
		document.getElementById('save-step').close();
		document.getElementById('my-step-name').value = '';
	}

	function insertMyStep(name, data) {
		data.mine = true;
		let beforeStep = null;

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
	const mySteps = JSON.parse(localStorage.getItem('mySteps') || '{}');
	for (const name in mySteps) {
		const data = mySteps[name];
		insertMyStep(name, data);
	}

	document.addEventListener('dragstart', (event) => {
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
		if (event.target.classList.contains('step')) {
			event.target.classList.remove('dragging');
			loadCombinedExamples();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			document.getElementById('view-source').close();
		}
	});

	function insertStep(step) {
		const stepClone = step.closest('.step').cloneNode(true);
		stepClone.removeAttribute('id');
		blueprintSteps.appendChild(stepClone);
		stepClone.classList.remove('dragging');
		stepClone.classList.remove('hidden');
		stepClone.querySelectorAll('input,textarea').forEach(fixMouseCursor);
		loadCombinedExamples();
		stepClone.querySelector('input,textarea')?.focus();
	}

	document.addEventListener('keyup', (event) => {
		if (event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}
		if (event.target.id === 'blueprint-compiled') {
			return;
		}
		if (event.target.id === 'linked-textarea') {
			linkedTextarea.value = event.target.value;
			loadCombinedExamples();
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
			if (event.target.closest('#filter') && document.getElementById('step-library').querySelectorAll('.step:not(.hidden)').length === 1) {
				insertStep(document.getElementById('step-library').querySelector('.step:not(.hidden)'));
				return false;
			}
			if (event.target.closest('input')) {
				loadCombinedExamples();
				document.getElementById('playground-link').click();
				return false;
			}
		}
		if (event.key == 'Escape') {
			if (event.target.closest('input,textarea')) {
				event.target.blur();
				return false;
			}
		}
		if (event.target.closest('#step-library .step')) {
			if (event.key === 'Escape') {
				event.target.closest('.step').blur();
			} else if (event.key === 'ArrowDown') {
				let nextStep = stepList.querySelector('.step:focus').nextElementSibling;
				while (nextStep && nextStep.classList.contains('hidden')) {
					if (!nextStep) {
						break;
					}
					nextStep = nextStep.nextElementSibling;
				}
				if (nextStep) {
					nextStep.focus();
				}
				return false;
			} else if (event.key === 'ArrowUp') {
				let prevStep = stepList.querySelector('.step:focus').previousElementSibling;
				while (prevStep && prevStep.classList.contains('hidden')) {
					if (!prevStep) {
						break;
					}
					prevStep = prevStep.previousElementSibling;
				}
				if (prevStep) {
					prevStep.focus();
				}
				return false;
			}
		}

		if (!event.target.closest('input,textarea')) {
			if (event.key.match(/^[a-z0-9]$/i) && !event.ctrlKey && !event.altKey && !event.metaKey) {
				document.getElementById('filter').value = event.key;
				document.getElementById('filter').focus();
				document.getElementById('filter').dispatchEvent(new Event('keyup'));
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
		if (!event.target.closest('#blueprint')) {
			return;
		}
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
			loadCombinedExamples();
			return;
		}
	});
	document.addEventListener('dblclick', (event) => {
		if (event.target.classList.contains('stepname')) {
			const step = event.target.closest('.step');
			step.parentNode.childNodes.forEach(function (s) {
				s.classList.toggle('collapsed');
			});
			return false;
		}
	});
	function makeParentStepDraggable(event) {
		event.target.closest('.step').setAttribute('draggable', true);
	}
	function makeParentStepUnDraggable(event) {
		event.target.closest('.step').setAttribute('draggable', false);
	}
	function fixMouseCursor(el) {
		el.addEventListener('mouseenter', makeParentStepUnDraggable);
		el.addEventListener('mouseleave', makeParentStepDraggable);
	}
	document.addEventListener('click', (event) => {
		let dialog;
		if (event.target.closest('#blueprint-steps')) {
			if (event.target.tagName === 'BUTTON') {
				if (event.target.classList.contains('code-editor')) {
					dialog = document.getElementById('code-editor');
					linkedTextarea = event.target.closest('.step').querySelector('textarea');
					dialog.querySelector('textarea').value = linkedTextarea.value;
					dialog.showModal();
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
						return value.split(/[^a-z0-9]/i).map(function (word) {
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
					clone.querySelectorAll('input,textarea').forEach(function (input) {
						if (input.type === 'text' || input.type === 'textarea') {
							input.value = '';
						} else if (input.type === 'checkbox') {
							input.checked = false;
						}
					});
					table.parentNode.appendChild(clone);
					return;
				}


				if (typeof customSteps[event.target.dataset.stepVar]?.vars[event.target.dataset.stepName]?.onclick === 'function') {
					return customSteps[event.target.dataset.stepVar].vars[event.target.dataset.stepName].onclick(event, loadCombinedExamples);
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

		if (event.target.closest('#step-library') && event.target.closest('.step').classList.contains('mine')) {
			if (event.target.classList.contains('delete')) {
				const name = event.target.closest('.step').dataset.id;
				if (confirm('Are you sure you want to delete the step ' + name + '?')) {
					event.target.closest('.step').remove();
					mySteps[name] = undefined;
					localStorage.setItem('mySteps', JSON.stringify(mySteps));
					loadCombinedExamples();
				}
				return false;
			}
			if (event.target.classList.contains('rename')) {
				const name = event.target.closest('.step').dataset.id;
				const newName = prompt('Enter a new name for the step:', name);
				if (newName) {
					const data = mySteps[name];
					mySteps[newName] = data;
					mySteps[name] = undefined;
					localStorage.setItem('mySteps', JSON.stringify(mySteps));
					event.target.closest('.step').dataset.id = newName;
					event.target.closest('.step').querySelector('.stepname').innerText = newName;
					loadCombinedExamples();
				}
				return false;
			}
			if (event.target.classList.contains('share')) {
				const data = location.href.replace(/#.*$/, '') + '#' + compressState([getStepData(event.target.closest('.step'))]);
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
		if (event.target.id === 'copy-playground-link') {
			navigator.clipboard.writeText(document.getElementById('playground-link').href);
			event.target.innerText = 'Copied!';
			setTimeout(function () {
				event.target.innerText = '⧉';
			}, 2000);
			return false;
		}
		dialog = document.getElementById('view-source');
		if (event.target.classList.contains('view-source')) {
			dialog.querySelector('h2').innerText = event.target.href.split('/').slice(event.target.href.includes('builtin') ? -3 : -2).join('/');
			dialog.showModal();
		} else {
			dialog.close();
			if (!event.target.closest('#code-editor')) {
				document.getElementById('code-editor').close();
			}
		}

		if (event.target.tagName === 'BUTTON' && event.target.closest('#save-step')) {
			return saveMyStep();
		}
		if (event.target.tagName === 'BUTTON' && event.target.closest('#code-editor')) {
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

	function getDragAfterElement(container, y) {
		const draggableElements = [...container.querySelectorAll('.step')];

		return draggableElements.reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		}, { offset: Number.NEGATIVE_INFINITY }).element;
	}

	document.getElementById('clear').addEventListener('click', function () {
		document.getElementById('title').value = '';
		blueprintSteps.innerHTML = '';
		document.getElementById('examples').value = 'Examples';
		loadCombinedExamples();
	});

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

	// Handle mode changes
	document.getElementById('mode').addEventListener('change', function () {
		loadCombinedExamples();
	});

	// Handle preview mode changes
	document.getElementById('preview-mode').addEventListener('change', function () {
		loadCombinedExamples();
	});

	// Handle blueprint version radio button changes
	document.querySelectorAll('input[name="blueprint-version"]').forEach(function (radio) {
		radio.addEventListener('change', function () {
			transformJson();
		});
	});

	function compressState(steps) {
		const state = {
			steps
		};
		if (document.getElementById('title').value) {
			state.title = document.getElementById('title').value;
		}
		if (document.getElementById('autosave').value) {
			state.autosave = document.getElementById('autosave').value;
		}
		if (document.getElementById('playground').value !== 'playground.wordpress.net') {
			state.playground = document.getElementById('playground').value;
		}
		if (document.getElementById('mode').value != 'browser-full-screen') {
			state.mode = document.getElementById('mode').value;
		}
		if (document.getElementById('preview-mode').value) {
			state.previewMode = document.getElementById('preview-mode').value;
		}
		const json = JSON.stringify(state);

		if ('{"steps":[]}' === json) {
			return '';
		}
		return encodeStringAsBase64(json);
	}

	function uncompressState(state) {
		try {
			return JSON.parse(decodeBase64ToString(state));
		} catch {
			return {};
		}
	}

	function decodeBase64ToString(base64) {
		return new TextDecoder().decode(decodeBase64ToUint8Array(base64));
	}

	function decodeBase64ToUint8Array(base64) {
		const binaryString = window.atob(base64); // This will convert base64 to binary string
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes;
	}

	function encodeStringAsBase64(str) {
		return encodeUint8ArrayAsBase64(new TextEncoder().encode(str));
	}

	function encodeUint8ArrayAsBase64(bytes) {
		const binString = String.fromCodePoint(...bytes);
		return btoa(binString);
	}
	function updateVariableVisibility(stepBlock) {
		stepBlock.querySelectorAll('input,select,textarea').forEach(function (input) {
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
	function getStepData(stepBlock) {
		const step = {
			'step': stepBlock.dataset.step,
			'vars': {}
		};
		stepBlock.querySelectorAll('input,select,textarea').forEach(function (input) {
			if (input.name === 'count') {
				step.count = parseInt(input.value);
				return;
			}
			if (typeof step.vars[input.name] !== 'undefined') {
				if (!Array.isArray(step.vars[input.name])) {
					step.vars[input.name] = [step.vars[input.name]];
				}
				if (input.type === 'checkbox') {
					step.vars[input.name].push(input.checked);
				} else {
					step.vars[input.name].push(input.value);
				}
			} else {
				if (input.type === 'checkbox') {
					step.vars[input.name] = input.checked;
				} else {
					step.vars[input.name] = input.value;
				}
			}
		});
		if (!Object.keys(step.vars).length) {
			delete step.vars;
		}
		return step;
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
				draghint.remove();
			}
		}

		blueprint = JSON.stringify(combinedExamples, null, 2);
		console.log(JSON.stringify({ [combinedExamples.title]: state }, null, 2).replace(/}$/, '').replace(/^{/, ''));

		const currentCompressedState = compressState(state);

		// Only update history and transform JSON if the state has changed
		if (currentCompressedState !== lastCompressedState) {
			lastCompressedState = currentCompressedState;
			history.pushState(state, '', '#' + currentCompressedState);
			transformJson();
		}
	}

	function transformJson() {
		let jsonInput = blueprint;
		const queries = [];
		let useBlueprintURLParam = false;

		// Prepare compilation options from UI elements
		const userDefined = {
			'landingPage': '/',
			'features': {}
		};
		if (document.getElementById('phpExtensionBundles').checked) {
			userDefined.phpExtensionBundles = ['kitchen-sink'];
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
		const useV2 = document.querySelector('input[name="blueprint-version"]:checked')?.value === 'v2';
		const outputData = compiler.compile(inputData, {}, useV2);

		// Extract query params from compiled steps (for the original web UI functionality)
		if (outputData.steps) {
			outputData.steps.forEach(function (step) {
				if (typeof step.queryParams === 'object') {
					for (let j in step.queryParams) {
						if ('gh-ensure-auth' === j) {
							useBlueprintURLParam = true;
						}
						queries.push(j + '=' + encodeURIComponent(step.queryParams[j]));
					}
					delete step.queryParams;
				}
			});
		}

		document.getElementById('blueprint-compiled').value = JSON.stringify(outputData, null, 2);

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
		let hash = '#' + (JSON.stringify(outputData).replace(/%/g, '%25'));
		if (hash.includes(' ') || hash.includes('<') || hash.includes('>')) {
			useBlueprintURLParam = true;
		}
		if (useBlueprintURLParam || document.getElementById('base64').checked) {
			// queries.push( 'blueprint-url=data:application/json;charset=utf-8,' + encodeURIComponent( JSON.stringify( outputData ) ) );
			queries.push('blueprint-url=data:application/json;base64,' + encodeURIComponent(encodeStringAsBase64(JSON.stringify(outputData))));
			hash = '';
		}
		const query = (queries.length ? '?' + queries.join('&') : '');
		const playground = document.getElementById('playground').value;
		const href = (playground.substr(0, 7) === 'http://' ? playground : 'https://' + playground) + '/' + query + hash;
		document.getElementById('playground-link').href = href;
		document.getElementById('playground-link-top').href = href;
		document.getElementById('download-blueprint').href = 'data:text/json;charset=utf-8,' + encodeURIComponent(document.getElementById('blueprint-compiled').value);

		// Handle split view mode
		handleSplitViewMode(href);
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
		state.steps = state.steps.map(function(step) {
			if (!step.vars || !variableMigrations[step.step]) {
				return step;
			}

			const migrations = variableMigrations[step.step];
			const migratedVars = {};

			// Copy existing vars and apply migrations
			Object.keys(step.vars).forEach(function(varName) {
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
	function autoredirect() {
		document.getElementById('autoredirecting').showModal();
		document.getElementById('autoredirect-title').textContent = document.getElementById('title').value;
		let seconds = 5;
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

	if (location.hash) {
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

		// Progress indicator clicks
		document.querySelectorAll('.wizard-step-indicator').forEach((indicator, index) => {
			indicator.addEventListener('click', () => {
				const targetStep = index + 1;
				if (targetStep <= wizardState.currentStep || targetStep === wizardState.currentStep + 1) {
					goToWizardStep(targetStep);
				}
			});
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
		document.getElementById('blueprint-compiled').value = JSON.stringify(finalBlueprint, null, '\t');
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

	// Initialize wizard
	initWizard();
});
