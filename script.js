const customSteps = {};
addEventListener('DOMContentLoaded', function() {
	const stepList = document.getElementById('step-library');
	const blueprintSteps = document.getElementById('blueprint-steps');

	for ( const i in customSteps ) {
		const step = document.createElement('div');
		step.dataset.step = i;
		step.className = 'step';
		step.innerText = i;
		if ( customSteps[i].info ) {
			const info = document.createElement('span');
			info.className = 'info';
			info.innerText = customSteps[i].info;
			step.appendChild(info);
			step.title = customSteps[i].info;
		}
		if ( customSteps[i].builtin ) {
			step.classList.add( 'builtin' );
		}

		const remove = document.createElement('a');
		remove.className = 'remove';
		remove.href = '';
		remove.innerText = '✕';
		step.appendChild(remove);

		const viewSource = document.createElement('a');
		viewSource.className = 'view-source';
		if ( customSteps[i].builtin ) {
			viewSource.href = 'steps/builtin/' + i + '.js';
		} else {
			viewSource.href = 'steps/' + i + '.js';
		}
		viewSource.innerText = 'View Source';
		viewSource.target = 'source-iframe';
		step.appendChild(viewSource);

		const vars = document.createElement('table');
		vars.className = 'vars';
		if ( customSteps[i].count ) {
			const tr = document.createElement('tr');
			let td = document.createElement('td');
			td.innerText = 'count';
			tr.appendChild(td);
			td = document.createElement('td');
			const input = document.createElement('input');
			input.type = 'text';
			input.name = 'count';
			input.pattern = "^\\d+$";
			input.value = customSteps[i].count;
			td.appendChild(input);
			tr.appendChild(td);
			vars.appendChild(tr);
		}

		if ( customSteps[i].vars ) {
			customSteps[i].vars.forEach(function( v ) {
				const tr = document.createElement('tr');
				let td = document.createElement('td');
				td.innerText = v.name;
				tr.appendChild(td);
				td = document.createElement('td');
				if ( v.type === 'boolean' ) {
					const input = document.createElement('input');
					input.name = v.name;
					input.type = 'checkbox';
					input.checked = v?.samples?.[0];
					const label = document.createElement('label');
					label.appendChild(input);
					label.appendChild(document.createTextNode(v.description));
					td.appendChild(label);
				} else if ( v.type === 'select' ) {
					const select = document.createElement('select');
					select.name = v.name;
					if ( 'options' in v ) {
						v.options.forEach(function( option ) {
							const optionElement = new Option( option, option, v.samples?.[0] === option, v.samples?.[0] === option );
							select.appendChild(optionElement);
						});
					}
					td.appendChild(select);
				} else {
					const input = document.createElement('input');
					input.name = v.name;
					input.type = 'text';
					input.placeholder = v.description;
					if ( v.required ) {
						input.required = true;
					}
					if ( v.regex ) {
						input.pattern = v.regex;
					}
					td.appendChild(input);
					if ( 'samples' in v ) {
						input.value = v.samples[0];
						if ( v.samples.length > 1 ) {
							const examples = document.createElement('details');
							const summary = document.createElement('summary');
							summary.innerText = 'Examples';
							examples.appendChild(summary);
							const ul = document.createElement('ul');
							examples.appendChild(ul);
							for ( let j = 0; j < v.samples.length; j++ ) {
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
		}
		step.appendChild(vars);
		step.setAttribute('data-id', i);
		step.setAttribute('draggable', true);

		stepList.appendChild(step);
	}

	document.addEventListener('dragstart', (event) => {
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

	document.addEventListener('keyup', (event) => {
		if ( event.target.id === 'blueprint' ) {
			transformJson();
			return;
		}
		loadCombinedExamples();
	});
	document.addEventListener('change', (event) => {
		if ( event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' ) {
			loadCombinedExamples();
			return;
		}
	});
	document.addEventListener('click', (event) => {
		if ( event.target.tagName === 'SELECT' ) {
			loadCombinedExamples();
			return;
		}
		if ( event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' ) {
			if ( event.target.type === 'checkbox' ) {
				loadCombinedExamples();
			} else {
				event.target.select();
			}
			return;
		}
		if ( event.target.classList.contains('step') && event.target.parentNode === stepList ) {
			const stepClone = event.target.cloneNode(true);
			blueprintSteps.appendChild(stepClone);
			stepClone.classList.remove('dragging');
			loadCombinedExamples();
			return;
		}
		if (event.target.classList.contains('remove') ) {
			event.target.parentNode.remove();
			loadCombinedExamples();
			event.preventDefault();
			return false;
		}
		if (event.target.classList.contains('sample') ) {
			event.target.closest('td').querySelector('input').value = event.target.innerText === '<empty>' ? '' : event.target.innerText;
			loadCombinedExamples();
			return;
		}
		const dialog = document.getElementById('view-source');
		if (event.target.classList.contains('view-source')) {
			dialog.querySelector('h2').innerText = event.target.href.split('/').slice( event.target.href.includes( 'builtin' ) ? -3 : -2).join('/');
			dialog.showModal();
		} else {
			dialog.close();
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

	document.getElementById( 'clear' ).addEventListener( 'click', function() {
		blueprintSteps.innerHTML = '';
		loadCombinedExamples();
	} );

	window.addEventListener('popstate', function(event) {
		if ( event.state ) {
			restoreState( event.state );
		}
	});

	window.addEventListener('hashchange', function(event) {
		if ( location.hash ) {
			restoreState( uncompressState( unescape( location.hash.slice(1) ) ) );
		}
	});

	document.getElementById('filter').addEventListener('keyup', function() {
		const filter = this.value.toLowerCase();
		stepList.querySelectorAll('.step').forEach(function(step) {
			step.style.display = step.dataset.id.toLowerCase().includes(filter) ? 'block' : 'none';
		});
	});

	document.getElementById('show-builtin').addEventListener('change', function() {
		if ( this.checked ) {
			stepList.classList.add('show-builtin');
		} else {
			stepList.classList.remove('show-builtin');
		}
	} );

	if (document.getElementById('show-builtin').checked) {
		stepList.classList.add('show-builtin');
	} else {
		stepList.classList.remove('show-builtin');
	}

	function compressState( state ) {
		return state.map( function( step ) {
			if ( step.count ) {
				if ( step.vars ) {
					step.vars.count = step.count;
				} else {
					step.vars = { count: step.count };
				}
			}
			if ( ! step.vars ) {
				return step.step;
			}
			return step.step + '__' + Object.keys( step.vars ).map(function(key) {
				return key + '--' + step.vars[key];
			} ).join('__');
		} ).join('&&');
	}

	function uncompressState( state ) {
		return state.split('&&').map( function( step ) {
			const parts = step.split('__');
			const stepData = {
				"step": parts.shift(),
				"vars": {}
			};
			parts.forEach( function( part ) {
				const kv = part.split('--');
				if ( kv[0] === 'count' ) {
					stepData.count = parseInt(kv[1]);
					return;
				}
				stepData.vars[kv[0]] = kv[1];
			} );
			return stepData;
		} );
	}

	function loadCombinedExamples() {
		const combinedExamples = {
			"landingPage": "/",
			"steps": []
		};
		const state = [];

		blueprintSteps.querySelectorAll('.step').forEach(function(stepBlock) {
			const step = {
				"step": stepBlock.dataset.step,
				"vars": {}
			};
			stepBlock.querySelectorAll('input,select').forEach(function(input) {
				if ( input.name === 'count' ) {
					step.count = parseInt(input.value);
					return;
				}
				if ( input.type === 'checkbox' ) {
					step.vars[input.name] = input.checked;
				} else {
					step.vars[input.name] = input.value;
				}
			});
			if (!Object.keys(step.vars).length) {
				delete step.vars;
			}
			state.push(step);
			combinedExamples.steps = combinedExamples.steps.concat(step);
		});
		if ( combinedExamples.steps.length > 0 ) {
			const draghint = document.getElementById('draghint');
			if (draghint) {
				draghint.remove();
			}
		}

		document.getElementById('blueprint').value = JSON.stringify(combinedExamples, null, 2);
		document.getElementById('landing-page').placeholder = combinedExamples.landingPage;
		history.pushState( state , '', '#' + compressState( state ) );
		transformJson();
	}

	function transformJson() {
		let jsonInput = document.getElementById('blueprint').value;
		const userDefined = {
			"landingPage": "/"
		};
		if ( document.getElementById('phpExtensionBundles').checked ) {
			userDefined.phpExtensionBundles = [ 'kitchen-sink' ];
		}
		if ( document.getElementById('networking').checked ) {
			userDefined.features = { 'networking': true };
		}
		if ( 'latest' !== document.getElementById('wp-version').value || 'latest' !== document.getElementById('php-version').value ) {
			userDefined.preferredVersions = {
				wp: document.getElementById('wp-version').value,
				php: document.getElementById('php-version').value
			};
		}
		let inputData = Object.assign( userDefined, JSON.parse(jsonInput) );
		const outputData = Object.assign( {}, inputData );
		outputData.steps = [];
		inputData.steps.forEach(function(step, index) {
			let outSteps = [];
			if ( customSteps[step.step] ) {
				outSteps = customSteps[step.step]( step, inputData );
				if ( outSteps.landingPage ) {
					outputData.landingPage = outSteps.landingPage;
				}
				if ( outSteps.login ) {
					outputData.login = outSteps.login;
				}
				if ( step.count ) {
					outSteps = outSteps.slice(0, step.count);
				}
			} else {
				outSteps.push(step);
			}
			const vars = step.vars || {};
			vars.step = index;

			for (let i = 0; i < outSteps.length; i++) {
				Object.keys(vars).forEach(function(key) {
					for ( j in outSteps[i] ) {
						if ( typeof outSteps[i][j] === 'object' ) {
							Object.keys(outSteps[i][j]).forEach(function( k ) {
								if ( typeof outSteps[i][j][k] === 'string' && outSteps[i][j][k].includes('${' + key + '}') ) {
									outSteps[i][j][k] = outSteps[i][j][k].replace('${' + key + '}', vars[key]);
								}
							});
						} else if ( typeof outSteps[i][j] === 'string' && outSteps[i][j].includes('${' + key + '}') ) {
							outSteps[i][j] = outSteps[i][j].replace('${' + key + '}', vars[key]);
						}
					}
				});
			}

			if ( outSteps ) {
				for (let i = 0; i < outSteps.length; i++) {
					if ( outSteps[i].dedup ) {
						const dedupStep = outputData.steps.find( function( step ) {
							return step.step === outSteps[i].step;
						} );
						if ( dedupStep ) {
							continue;
						}
						delete outSteps[i].dedup;
					}
					outputData.steps.push(outSteps[i]);
				}
			}
		});
		if ( document.getElementById('landing-page').value ) {
			outputData.landingPage = document.getElementById('landing-page').value;
		}

		document.getElementById('blueprint-compiled').value = JSON.stringify(outputData, null, 2);

		const a = document.getElementById('playground-link');
		const queries = [];
		switch ( document.getElementById('mode').value ) {
			case 'browser':
				queries.push( 'mode=browser' );
				break;
			case 'seamless':
				queries.push( 'mode=seamless' );
				break;
		}
		switch ( document.getElementById('storage').value ) {
			case 'browser':
				queries.push( 'storage=browser' );
				break;
			case 'device':
				queries.push( 'storage=device' );
				break;
		}
		const query = (queries.length ? '?' + queries.join('&') : '') + '#';
		const href = 'https://playground.wordpress.net/' + query + ( JSON.stringify( outputData ).replace( /%/g, '%25' ) );
		document.getElementById('playground-link').href = href;
		document.getElementById('playground-link-top').href = href;
	}

	function restoreState( state ) {
		if ( ! state || ! state.length ) {
			return;
		}
		blueprintSteps.innerHTML = '';
		state.forEach(function(step) {
			const block = stepList.querySelector('[data-step="' + step.step + '"]');
			if ( ! block ) {
				return;
			}
			const stepBlock = block.cloneNode(true);
			stepBlock.classList.remove('dragging');
			blueprintSteps.appendChild(stepBlock);
			if ( step.count ) {
				stepBlock.querySelector('[name="count"]').value = step.count;
			}
			Object.keys(step.vars).forEach(function(key) {
				if ( key === 'step' ) {
					return;
				}
				const input = stepBlock.querySelector('[name="' + key + '"]');
				if ( 'SELECT' === input.tagName ) {
					input.value = step.vars[key];
				} else if ( 'checkbox' === input.type ) {
					input.checked = 'false' !== step.vars[key];
				} else {
					input.value = step.vars[key];
				}
			});
		});
		loadCombinedExamples();
	}
	if ( location.hash ) {
		restoreState( uncompressState( unescape( location.hash.slice(1) ) ) );
	} else {
		loadCombinedExamples();
	}
} );
