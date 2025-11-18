import { StepDefinition, ShowCallbacks } from './types';
import { encodeStringAsBase64 } from './utils';

export function makeParentStepDraggable(event: Event): void {
	if (event.target instanceof Element) {
		const step = event.target.closest('.step');
		if (step) step.setAttribute('draggable', 'true');
	}
}

export function makeParentStepUnDraggable(event: Event): void {
	if (event.target instanceof Element) {
		const step = event.target.closest('.step');
		if (step) step.setAttribute('draggable', 'false');
	}
}

export function fixMouseCursor(el: Element): void {
	el.addEventListener('mouseenter', makeParentStepUnDraggable);
	el.addEventListener('mouseleave', makeParentStepDraggable);
}

export function createStep(
	name: string,
	data: StepDefinition,
	showCallbacks: ShowCallbacks
): HTMLDivElement {
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
				button.textContent = v.label || '';
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
	step.setAttribute('draggable', 'true');

	return step;
}
