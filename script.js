const customSteps = {};
addEventListener( 'DOMContentLoaded', function () {
	const stepList = document.getElementById( 'step-library' );
	const blueprintSteps = document.getElementById( 'blueprint-steps' );
	let blueprint = '';
	let linkedTextarea = null;
	const showCallbacks = {};

	function createStep( name, data ) {
		const step = document.createElement( 'div' );
		step.dataset.step = data.step;
		step.className = 'step';
		step.tabIndex = 0;
		const span = document.createElement( 'span' );
		span.className = 'stepname';
		span.innerText = name;
		step.appendChild( span );
		if ( data.info ) {
			const info = document.createElement( 'span' );
			info.className = 'info';
			info.innerText = data.info;
			step.appendChild( info );
			step.title = data.info;
		}
		if ( data.mine ) {
			step.classList.add( 'mine' );
			const options = document.createElement( 'details' );
			options.appendChild( document.createElement( 'summary' ) );
			options.className = 'options';
			const del = document.createElement( 'button' );
			del.innerText = 'Delete';
			del.title = 'Delete this step';
			del.href = '';
			del.className = 'delete';
			options.appendChild( del );
			const rename = document.createElement( 'button' );
			rename.innerText = 'Rename';
			rename.title = 'Rename this step';
			rename.href = '';
			rename.className = 'rename';
			options.appendChild( rename );
			const share = document.createElement( 'button' );
			share.innerText = 'Share';
			share.title = 'Copy a shareable link to this step';
			share.href = '';
			share.className = 'share';
			options.appendChild( share );
			const gh = document.createElement( 'a' );
			gh.innerText = 'Submit to Github';
			let shareBody = 'I\'d like to submit a step to the WordPress Playground: \n\n';
			shareBody += 'Name: **' + name + '.js**\n\n';
			shareBody += 'I\'d like to submit a step to the WordPress Playground: \n\n```js\n';
			shareBody += 'customSteps.' + name + ' = customSteps.' + data.step + ';\n';
			shareBody += 'customSteps.' + name + '.info = ' + JSON.stringify( data.info, null, 2 ) + ';\n';
			if ( data.multiple ) {
				shareBody += 'customSteps.' + name + '.multiple = true;\n';
			}
			shareBody += 'customSteps.' + name + '.vars = ' + JSON.stringify( data.vars, null, 2 ).replace( /\\n/g, '\\n" + \n"' ) + ';\n';
			shareBody += '\n```';
			gh.href = 'https://github.com/akirk/playground-step-library/issues/new?body=' + encodeURIComponent( shareBody ) + '&title=Add+a+' + encodeURIComponent( name ) + '+step';
			gh.className = 'submit-to-gh';
			gh.title = 'Submit this step to GitHub';
			options.appendChild( gh );
			step.appendChild( options );

		} else if ( data.builtin ) {
			step.classList.add( 'builtin' );
		}


		const remove = document.createElement( 'a' );
		remove.className = 'remove';
		remove.href = '';
		remove.innerText = '✕';
		step.appendChild( remove );

		const viewSource = document.createElement( 'a' );
		viewSource.className = 'view-source';
		if ( data.builtin ) {
			viewSource.href = 'steps/builtin/' + name + '.js';
		} else {
			viewSource.href = 'steps/' + name + '.js';
		}
		viewSource.innerText = 'View Source';
		viewSource.target = 'source-iframe';
		step.appendChild( viewSource );

		const saveStep = document.createElement( 'button' );
		saveStep.className = 'save-step';
		saveStep.innerText = 'Save As Personal Step';
		step.appendChild( saveStep );

		const vars = document.createElement( 'table' );
		vars.className = 'vars';
		if ( data.count ) {
			const tr = document.createElement( 'tr' );
			let td = document.createElement( 'td' );
			td.innerText = 'count';
			tr.appendChild( td );
			td = document.createElement( 'td' );
			const input = document.createElement( 'input' );
			input.type = 'text';
			input.name = 'count';
			input.pattern = '^\\d+$';
			input.value = data.count;
			td.appendChild( input );
			tr.appendChild( td );
			vars.appendChild( tr );
		}
		step.appendChild( vars );

		if ( data.vars ) {
			data.vars.forEach( function ( v, k ) {
				if ( typeof v.show === 'function' ) {
					if ( typeof showCallbacks[ data.step ] === 'undefined' ) {
						showCallbacks[ data.step ] = {};
					}
					showCallbacks[ data.step ][ v.name ] = v.show;
				}

				let input;
				const tr = document.createElement( 'tr' );
				let td = document.createElement( 'td' );
				td.innerText = v.name || '';
				tr.appendChild( td );

				td = document.createElement( 'td' );
				if ( v.type === 'boolean' ) {
					const input = document.createElement( 'input' );
					input.name = v.name;
					input.type = 'checkbox';
					input.checked = v?.samples?.[ 0 ] === 'true' || v?.samples?.[ 0 ] === true;
					const label = document.createElement( 'label' );
					label.appendChild( input );
					label.appendChild( document.createTextNode( v.description ) );
					td.appendChild( label );
				} else if ( v.type === 'select' ) {
					const select = document.createElement( 'select' );
					select.name = v.name;
					if ( 'options' in v ) {
						v.options.forEach( function ( option ) {
							const optionElement = new Option( option, option, v.samples?.[ 0 ] === option, v.samples?.[ 0 ] === option );
							select.appendChild( optionElement );
						} );
					}
					td.appendChild( select );
				} else if ( v.type === 'textarea' ) {
					input = document.createElement( 'textarea' );
					input.name = v.name;
					input.placeholder = v.description;
					if ( v.required ) {
						input.required = true;
					}
					td.appendChild( input );
					if ( 'samples' in v ) {
						input.value = v.samples[ 0 ];
						if ( v.samples.length > 1 ) {
							const examples = document.createElement( 'details' );
							const summary = document.createElement( 'summary' );
							summary.innerText = 'Examples';
							examples.appendChild( summary );
							const ul = document.createElement( 'ul' );
							examples.appendChild( ul );
							for ( let j = 0; j < v.samples.length; j++ ) {
								if ( '' === v.samples[ j ] ) {
									continue;
								}
								const sample = document.createElement( 'li' );
								sample.className = 'sample';
								sample.innerText = v.samples[ j ];
								ul.appendChild( sample );
							}
							examples.className = 'examples for-textarea';
							td.appendChild( examples );
						}
					}
					const codeEditorButton = document.createElement( 'button' );
					codeEditorButton.innerText = 'Code Editor';
					codeEditorButton.className = 'code-editor';
					td.appendChild( codeEditorButton );
				} else if ( v.type === 'button' ) {
					const button = document.createElement( 'button' );
					button.textContent = v.label;
					td.appendChild( button );
					button.dataset.stepName = k;
					button.dataset.stepVar = name;
				} else {
					input = document.createElement( 'input' );
					input.name = v.name;
					input.type = v.type ?? 'text';
					input.placeholder = v.description;
					if ( v.required ) {
						input.required = true;
					}
					if ( v.regex ) {
						input.pattern = v.regex;
					}
					td.appendChild( input );
					if ( 'samples' in v ) {
						input.value = v.samples[ 0 ];
						if ( v.samples.length > 1 ) {
							const examples = document.createElement( 'details' );
							const summary = document.createElement( 'summary' );
							summary.innerText = 'Examples';
							examples.appendChild( summary );
							const ul = document.createElement( 'ul' );
							examples.appendChild( ul );
							for ( let j = 0; j < v.samples.length; j++ ) {
								const sample = document.createElement( 'li' );
								sample.className = 'sample';
								sample.innerText = '' === v.samples[ j ] ? '<empty>' : v.samples[ j ];
								ul.appendChild( sample );
							}
							examples.className = 'examples';
							td.appendChild( examples );
						}
					}
				}
				tr.appendChild( td );
				vars.appendChild( tr );
			} );
			if ( data.multiple ) {
				const add = document.createElement( 'button' );
				add.innerText = 'Add';
				add.className = 'add';
				step.appendChild( add );
			}
			if ( data.vars ) {
				for ( let j = 0; j < data.vars.length; j++ ) {
					if ( typeof data.vars[ j ].setValue === 'undefined' ) {
						continue;
					}
					const key = data.vars[ j ].name;
					if ( !Array.isArray( data.vars[ j ].setValue ) ) {
						data.vars[ j ].setValue = [ data.vars[ j ].setValue ];
					}
					for ( let i = 0; i < data.vars[ j ].setValue.length; i++ ) {
						const vars = step.querySelector( '.vars' );
						const inputs = step.querySelectorAll( '[name="' + key + '"]' );
						if ( typeof inputs[ i ] === 'undefined' ) {
							const clone = vars.cloneNode( true );
							vars.parentNode.appendChild( clone );
							clone.querySelectorAll( 'input,textarea' ).forEach( fixMouseCursor );
						}
						const value = data.vars[ j ].setValue[ i ];
						const input = step.querySelectorAll( '[name="' + key + '"]' )[ i ];
						if ( 'checkbox' === input.type ) {
							input.checked = value === 'true' || value === true;
						} else {
							input.value = value;
						}
					}
				}
			}
		}
		step.setAttribute( 'id', 'step-' + name );
		step.setAttribute( 'data-id', name );
		step.setAttribute( 'draggable', true );

		return step;
	}

	function saveMyStep() {
		const myStepName = document.getElementById( 'my-step-name' ).value;
		const myStep = JSON.parse( document.getElementById( 'save-step' ).dataset.step );
		insertMyStep( myStepName, myStep );
		mySteps[ myStepName ] = myStep;
		localStorage.setItem( 'mySteps', JSON.stringify( mySteps ) );
		document.getElementById( 'save-step' ).close();
		document.getElementById( 'my-step-name' ).value = '';
	}

	function insertMyStep( name, data ) {
		data.mine = true;
		let beforeStep = null;

		for ( const j in stepList.children ) {
			if ( stepList.children[ j ].dataset.id > name ) {
				beforeStep = stepList.children[ j ];
				break;
			}
			if ( !stepList.children[ j ].classList.contains( 'mine' ) ) {
				beforeStep = stepList.querySelector( '.step.builtin' );
				break;
			}
		}
		const step = createStep( name, data );
		stepList.insertBefore( step, beforeStep );
		step.querySelectorAll( 'input,textarea' ).forEach( fixMouseCursor );
	}

	for ( const name in customSteps ) {
		const data = customSteps[ name ];
		data.step = name;
		const step = createStep( name, data );
		stepList.appendChild( step );
		step.querySelectorAll( 'input,textarea' ).forEach( fixMouseCursor );

	}
	const mySteps = JSON.parse( localStorage.getItem( 'mySteps' ) || '{}' );
	for ( const name in mySteps ) {
		const data = mySteps[ name ];
		insertMyStep( name, data );
	}

	document.addEventListener( 'dragstart', ( event ) => {
		if ( event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA' ) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if ( event.target.classList.contains( 'step' ) ) {
			event.target.classList.add( 'dragging' );
		}
	} );

	document.addEventListener( 'dragend', ( event ) => {
		if ( event.target.classList.contains( 'step' ) ) {
			event.target.classList.remove( 'dragging' );
			loadCombinedExamples();
		}
	} );

	document.addEventListener( 'keydown', ( event ) => {
		if ( event.key === 'Escape' ) {
			document.getElementById( 'view-source' ).close();
		}
	} );

	function insertStep( step ) {
		const stepClone = step.closest( '.step' ).cloneNode( true );
		stepClone.removeAttribute( 'id' );
		blueprintSteps.appendChild( stepClone );
		stepClone.classList.remove( 'dragging' );
		stepClone.classList.remove( 'hidden' );
		stepClone.querySelectorAll( 'input,textarea' ).forEach( fixMouseCursor );
		loadCombinedExamples();
		stepClone.querySelector( 'input,textarea' )?.focus();
	}

	document.addEventListener( 'keyup', ( event ) => {
		if ( event.ctrlKey || event.altKey || event.metaKey ) {
			return;
		}
		if ( event.target.id === 'blueprint-compiled' ) {
			return;
		}
		if ( event.target.id === 'linked-textarea' ) {
			linkedTextarea.value = event.target.value;
			loadCombinedExamples();
			return;
		}
		if ( event.key === 'Enter' ) {
			if ( event.target.closest( '#save-step' ) ) {
				return saveMyStep();
			}
			if ( event.target.closest( '#step-library .step' ) ) {
				insertStep( event.target );
				return false;
			}
			if ( event.target.closest( '#filter' ) && document.getElementById( 'step-library' ).querySelectorAll( '.step:not(.hidden)' ).length === 1 ) {
				insertStep( document.getElementById( 'step-library' ).querySelector( '.step:not(.hidden)' ) );
				return false;
			}
			if ( event.target.closest( 'input' ) ) {
				loadCombinedExamples();
				document.getElementById( 'playground-link' ).click();
				return false;
			}
		}
		if ( event.key == 'Escape' ) {
			if ( event.target.closest( 'input,textarea' ) ) {
				event.target.blur();
				return false;
			}
		}
		if ( event.target.closest( '#step-library .step' ) ) {
			if ( event.key === 'Escape' ) {
				event.target.closest( '.step' ).blur();
			} else if ( event.key === 'ArrowDown' ) {
				let nextStep = stepList.querySelector( '.step:focus' ).nextElementSibling;
				while ( nextStep && nextStep.classList.contains( 'hidden' ) ) {
					if ( !nextStep ) {
						break;
					}
					nextStep = nextStep.nextElementSibling;
				}
				if ( nextStep ) {
					nextStep.focus();
				}
				return false;
			} else if ( event.key === 'ArrowUp' ) {
				let prevStep = stepList.querySelector( '.step:focus' ).previousElementSibling;
				while ( prevStep && prevStep.classList.contains( 'hidden' ) ) {
					if ( !prevStep ) {
						break;
					}
					prevStep = prevStep.previousElementSibling;
				}
				if ( prevStep ) {
					prevStep.focus();
				}
				return false;
			}
		}

		if ( !event.target.closest( 'input,textarea' ) ) {
			if ( event.key.match( /^[a-z0-9]$/i ) && !event.ctrlKey && !event.altKey && !event.metaKey ) {
				document.getElementById( 'filter' ).value = event.key;
				document.getElementById( 'filter' ).focus();
				document.getElementById( 'filter' ).dispatchEvent( new Event( 'keyup' ) );
				return;
			} else if ( event.key === 'ArrowUp' ) {
				stepList.querySelector( '.step:last-child' ).focus();
				return;
			} else if ( event.key === 'ArrowDown' ) {
				stepList.querySelector( '.step' ).focus();
				return;
			}
		}

		loadCombinedExamples();
	} );
	document.addEventListener( 'change', ( event ) => {
		if ( !event.target.closest( '#blueprint' ) ) {
			return;
		}
		if ( event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA' ) {
			loadCombinedExamples();
			return;
		}
	} );
	document.addEventListener( 'dblclick', ( event ) => {
		if ( event.target.classList.contains( 'stepname' ) ) {
			const step = event.target.closest( '.step' );
			step.parentNode.childNodes.forEach( function ( s ) {
				s.classList.toggle( 'collapsed' );
			} );
			return false;
		}
	} );
	function makeParentStepDraggable( event ) {
		event.target.closest( '.step' ).setAttribute( 'draggable', true );
	}
	function makeParentStepUnDraggable( event ) {
		event.target.closest( '.step' ).setAttribute( 'draggable', false );
	}
	function fixMouseCursor( el ) {
		el.addEventListener( 'mouseenter', makeParentStepUnDraggable );
		el.addEventListener( 'mouseleave', makeParentStepDraggable );
	}
	document.addEventListener( 'click', ( event ) => {
		let dialog;
		if ( event.target.closest( '#blueprint-steps' ) ) {
			if ( event.target.tagName === 'BUTTON' ) {
				if ( event.target.classList.contains( 'code-editor' ) ) {
					dialog = document.getElementById( 'code-editor' );
					linkedTextarea = event.target.closest( '.step' ).querySelector( 'textarea' );
					dialog.querySelector( 'textarea' ).value = linkedTextarea.value;
					dialog.showModal();
					return;
				}

				if ( event.target.classList.contains( 'save-step' ) ) {
					dialog = document.getElementById( 'save-step' );
					const stepData = getStepData( event.target.closest( '.step' ) );
					const myStep = Object.assign( {}, customSteps[ stepData.step ] );
					for ( let i = 0; i < myStep.vars.length; i++ ) {
						if ( myStep.vars[ i ].name in stepData.vars && stepData.vars[ myStep.vars[ i ].name ] ) {
							myStep.vars[ i ].setValue = stepData.vars[ myStep.vars[ i ].name ];
						}
					}
					dialog.querySelector( 'input' ).value = stepData.step + Object.values( stepData.vars ).map( function ( value ) {
						if ( typeof value !== 'string' ) {
							return '';
						}
						return value.split( /[^a-z0-9]/i ).map( function ( word ) {
							return word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase();
						} ).join( '' );
					} ).join( '' );
					dialog.dataset.step = JSON.stringify( myStep );
					dialog.showModal();
					return;
				}

				if ( event.target.classList.contains( 'add' ) ) {
					const table = event.target.closest( '.step' ).querySelector( '.vars' );
					const clone = table.cloneNode( true );
					clone.querySelectorAll( 'input,textarea' ).forEach( fixMouseCursor );
					clone.querySelectorAll( 'input,textarea' ).forEach( function ( input ) {
						if ( input.type === 'text' || input.type === 'textarea' ) {
							input.value = '';
						} else if ( input.type === 'checkbox' ) {
							input.checked = false;
						}
					} );
					table.parentNode.appendChild( clone );
					return;
				}


				if ( typeof customSteps[ event.target.dataset.stepVar ]?.vars[ event.target.dataset.stepName ]?.onclick === 'function' ) {
					return customSteps[ event.target.dataset.stepVar ].vars[ event.target.dataset.stepName ].onclick( event, loadCombinedExamples );
				}
				return;
			}
			if ( event.target.tagName === 'SELECT' ) {
				loadCombinedExamples();
				return;
			}

			if ( event.target.classList.contains( 'stepname' ) ) {
				event.target.closest( '.step' ).classList.toggle( 'collapsed' );
				return false;
			}
		}

		if ( event.target.tagName === 'LABEL' ) {
			const input = event.target.querySelector( 'input, select' );
			if ( input.type === 'checkbox' ) {
				loadCombinedExamples();
			}
			return;
		}
		if ( event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' ) {
			if ( event.target.type === 'checkbox' ) {
				loadCombinedExamples();
			}
			return;
		}

		if ( event.target.closest( '#step-library' ) && event.target.closest( '.step' ).classList.contains( 'mine' ) ) {
			if ( event.target.classList.contains( 'delete' ) ) {
				const name = event.target.closest( '.step' ).dataset.id;
				if ( confirm( 'Are you sure you want to delete the step ' + name + '?' ) ) {
					event.target.closest( '.step' ).remove();
					mySteps[ name ] = undefined;
					localStorage.setItem( 'mySteps', JSON.stringify( mySteps ) );
					loadCombinedExamples();
				}
				return false;
			}
			if ( event.target.classList.contains( 'rename' ) ) {
				const name = event.target.closest( '.step' ).dataset.id;
				const newName = prompt( 'Enter a new name for the step:', name );
				if ( newName ) {
					const data = mySteps[ name ];
					mySteps[ newName ] = data;
					mySteps[ name ] = undefined;
					localStorage.setItem( 'mySteps', JSON.stringify( mySteps ) );
					event.target.closest( '.step' ).dataset.id = newName;
					event.target.closest( '.step' ).querySelector( '.stepname' ).innerText = newName;
					loadCombinedExamples();
				}
				return false;
			}
			if ( event.target.classList.contains( 'share' ) ) {
				const data = location.href.replace( /#.*$/, '' ) + '#' + compressState( [ getStepData( event.target.closest( '.step' ) ) ] );
				navigator.clipboard.writeText( data );
				event.target.innerText = 'Copied!';
				setTimeout( function () {
					event.target.innerText = 'Share';
				}, 2000 );
				return false;
			}
		}

		if ( event.target.closest( '.step' ) && event.target.closest( '#step-library' ) && !event.target.closest( 'details' ) ) {
			insertStep( event.target );
			return;
		}
		if ( event.target.classList.contains( 'remove' ) ) {
			event.target.parentNode.remove();
			loadCombinedExamples();
			event.preventDefault();
			return false;
		}
		if ( event.target.classList.contains( 'sample' ) ) {
			event.target.closest( 'td' ).querySelector( 'input,textarea' ).value = event.target.innerText === '<empty>' ? '' : event.target.innerText;
			loadCombinedExamples();
			return;
		}
		if ( event.target.id === 'copy-playground-link' ) {
			navigator.clipboard.writeText( document.getElementById( 'playground-link' ).href );
			event.target.innerText = 'Copied!';
			setTimeout( function () {
				event.target.innerText = '⧉';
			}, 2000 );
			return false;
		}
		dialog = document.getElementById( 'view-source' );
		if ( event.target.classList.contains( 'view-source' ) ) {
			dialog.querySelector( 'h2' ).innerText = event.target.href.split( '/' ).slice( event.target.href.includes( 'builtin' ) ? -3 : -2 ).join( '/' );
			dialog.showModal();
		} else {
			dialog.close();
			if ( !event.target.closest( '#code-editor' ) ) {
				document.getElementById( 'code-editor' ).close();
			}
		}

		if ( event.target.tagName === 'BUTTON' && event.target.closest( '#save-step' ) ) {
			return saveMyStep();
		}
		if ( event.target.tagName === 'BUTTON' && event.target.closest( '#code-editor' ) ) {
			return document.getElementById( 'code-editor' ).close();
		}
	} );
	blueprintSteps.addEventListener( 'dragover', ( event ) => {
		event.preventDefault();
	} );

	blueprintSteps.addEventListener( 'drop', ( event ) => {
		event.preventDefault();

		const droppedStep = document.querySelector( '.dragging' );
		if ( droppedStep && droppedStep.parentNode === stepList ) {
			const stepClone = droppedStep.cloneNode( true );
			blueprintSteps.appendChild( stepClone );
			stepClone.querySelectorAll( 'input,textarea' ).forEach( fixMouseCursor );
			stepClone.classList.remove( 'dragging' );
		}
	} );

	// Enable reordering of blocks within block area
	blueprintSteps.addEventListener( 'dragover', ( event ) => {
		const draggable = document.querySelector( '.dragging' );
		if ( !draggable || draggable.parentNode === stepList ) {
			return;
		}
		event.preventDefault();
		const afterElement = getDragAfterElement( blueprintSteps, event.clientY );
		if ( afterElement == null ) {
			blueprintSteps.appendChild( draggable );
		} else {
			blueprintSteps.insertBefore( draggable, afterElement );
		}
		loadCombinedExamples();
	} );

	// Remove block when dragged out
	blueprintSteps.addEventListener( 'dragleave', ( event ) => {
		const draggable = document.querySelector( '.dragging' );
		if ( !draggable || draggable.parentNode === stepList ) {
			return;
		}
		if ( event.relatedTarget === null || !blueprintSteps.contains( event.relatedTarget ) ) {
			const removedBlock = document.querySelector( '.dragging' );
			if ( removedBlock ) {
				removedBlock.remove();
			}
		}
		loadCombinedExamples();
	} );

	function getDragAfterElement( container, y ) {
		const draggableElements = [ ...container.querySelectorAll( '.step' ) ];

		return draggableElements.reduce( ( closest, child ) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if ( offset < 0 && offset > closest.offset ) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		}, { offset: Number.NEGATIVE_INFINITY } ).element;
	}

	document.getElementById( 'clear' ).addEventListener( 'click', function () {
		document.getElementById( 'title' ).value = '';
		blueprintSteps.innerHTML = '';
		document.getElementById( 'examples' ).value = 'Examples';
		loadCombinedExamples();
	} );

	window.addEventListener( 'popstate', function ( event ) {
		if ( event.state ) {
			restoreState( event.state );
		}
	} );

	window.addEventListener( 'hashchange', function () {
		if ( location.hash ) {
			restoreState( uncompressState( location.hash.slice( 1 ) ) );
		}
	} );

	document.getElementById( 'filter' ).addEventListener( 'keyup', function ( event ) {
		// convert to a fuzzy search term by allowing any character to be followed by any number of any characters
		const filter = new RegExp( this.value.replace( /(.)/g, '$1.*' ), 'i' );
		stepList.querySelectorAll( '.step' ).forEach( function ( step ) {
			if ( step.dataset.id.toLowerCase().match( filter ) ) {
				step.classList.remove( 'hidden' );
			} else {
				step.classList.add( 'hidden' );
			}
		} );
		if ( event.key === 'ArrowDown' ) {
			const steps = stepList.querySelectorAll( '.step' );
			for ( let i = 0; i < steps.length; i++ ) {
				if ( !steps[ i ].classList.contains( 'hidden' ) ) {
					steps[ i ].focus();
					break;
				}
			}
			return false;
		}
	} );

	document.getElementById( 'show-builtin' ).addEventListener( 'change', function () {
		if ( this.checked ) {
			stepList.classList.add( 'show-builtin' );
		} else {
			stepList.classList.remove( 'show-builtin' );
		}
	} );

	if ( document.getElementById( 'show-builtin' ).checked ) {
		stepList.classList.add( 'show-builtin' );
	} else {
		stepList.classList.remove( 'show-builtin' );
	}

	function compressState( steps ) {
		const state = {
			steps
		};
		if ( document.getElementById( 'title' ).value ) {
			state.title = document.getElementById( 'title' ).value;
		}
		if ( document.getElementById( 'networking' ).checked ) {
			state.networking = true;
		}
		if ( document.getElementById( 'autosave' ).value ) {
			state.autosave = document.getElementById( 'autosave' ).value;
		}
		const json = JSON.stringify( state );
		if ( '{"steps":[]}' === json ) {
			return '';
		}
		return encodeStringAsBase64( json );
	}

	function uncompressState( state ) {
		try {
			return JSON.parse( decodeBase64ToString( state ) );
		} catch {
			return {};
		}
	}

	function decodeBase64ToString( base64 ) {
		return new TextDecoder().decode( decodeBase64ToUint8Array( base64 ) );
	}

	function decodeBase64ToUint8Array( base64 ) {
		const binaryString = window.atob( base64 ); // This will convert base64 to binary string
		const len = binaryString.length;
		const bytes = new Uint8Array( len );
		for ( let i = 0; i < len; i++ ) {
			bytes[ i ] = binaryString.charCodeAt( i );
		}
		return bytes;
	}

	function encodeStringAsBase64( str ) {
		return encodeUint8ArrayAsBase64( new TextEncoder().encode( str ) );
	}

	function encodeUint8ArrayAsBase64( bytes ) {
		const binString = String.fromCodePoint( ...bytes );
		return btoa( binString );
	}
	function updateVariableVisibility( stepBlock ) {
		stepBlock.querySelectorAll( 'input,select,textarea' ).forEach( function ( input ) {
			if ( ! input || typeof showCallbacks[ stepBlock.dataset.step ][ input.name ] !== 'function' ) {
				return;
			}
			const tr = input.closest( 'tr' );
			if ( showCallbacks[ stepBlock.dataset.step ][input.name]( stepBlock ) ) {
				tr.style.display = '';
			} else {
				tr.style.display = 'none';
			}
		} );
	}
	function getStepData( stepBlock ) {
		const step = {
			'step': stepBlock.dataset.step,
			'vars': {}
		};
		stepBlock.querySelectorAll( 'input,select,textarea' ).forEach( function ( input ) {
			if ( input.name === 'count' ) {
				step.count = parseInt( input.value );
				return;
			}
			if ( typeof step.vars[ input.name ] !== 'undefined' ) {
				if ( !Array.isArray( step.vars[ input.name ] ) ) {
					step.vars[ input.name ] = [ step.vars[ input.name ] ];
				}
				if ( input.type === 'checkbox' ) {
					step.vars[ input.name ].push( input.checked );
				} else {
					step.vars[ input.name ].push( input.value );
				}
			} else {
				if ( input.type === 'checkbox' ) {
					step.vars[ input.name ] = input.checked;
				} else {
					step.vars[ input.name ] = input.value;
				}
			}
		} );
		if ( !Object.keys( step.vars ).length ) {
			delete step.vars;
		}
		return step;
	}

	function loadCombinedExamples() {
		const combinedExamples = {};
		if ( document.getElementById( 'title' ).value ) {
			combinedExamples.title = document.getElementById( 'title' ).value;
		}
		combinedExamples.landingPage = '/';
		combinedExamples.steps = [];
		const state = [];

		blueprintSteps.querySelectorAll( '.step' ).forEach( function ( stepBlock ) {
			updateVariableVisibility( stepBlock );
			const step = getStepData( stepBlock );
			state.push( step );
			combinedExamples.steps = combinedExamples.steps.concat( step );
		} );
		if ( combinedExamples.steps.length > 0 ) {
			const draghint = document.getElementById( 'draghint' );
			if ( draghint ) {
				draghint.remove();
			}
		}

		blueprint = JSON.stringify( combinedExamples, null, 2 );
		// console.log( state );
		history.pushState( state, '', '#' + compressState( state ) );
		transformJson();
	}

	function transformJson() {
		let j, jsonInput = blueprint;
		const queries = [];
		let useBlueprintURLParam = false;
		const userDefined = {
			'landingPage': '/',
			'features': {}
		};
		if ( document.getElementById( 'phpExtensionBundles' ).checked ) {
			userDefined.phpExtensionBundles = [ 'kitchen-sink' ];
		}
		if ( document.getElementById( 'networking' ).checked ) {
			userDefined.features = { 'networking': true };
		}
		if ( 'latest' !== document.getElementById( 'wp-version' ).value || 'latest' !== document.getElementById( 'php-version' ).value ) {
			userDefined.preferredVersions = {
				wp: document.getElementById( 'wp-version' ).value,
				php: document.getElementById( 'php-version' ).value
			};
		}

		let inputData = Object.assign( userDefined, JSON.parse( jsonInput ) );
		console.log( JSON.stringify( inputData, null, 2 ) );
		const outputData = Object.assign( {}, inputData );
		if ( outputData.title ) {
			delete outputData.title;
		}
		outputData.steps = [];
		inputData.steps.forEach( function ( step, index ) {
			let outSteps = [];
			if ( !step.vars ) {
				step.vars = {};
			}
			step.vars.stepIndex = index;
			if ( customSteps[ step.step ] ) {
				outSteps = customSteps[ step.step ]( step, inputData );
				if ( typeof outSteps !== 'object' ) {
					outSteps = [];
				}
				if ( outSteps.landingPage ) {
					outputData.landingPage = outSteps.landingPage;
				}
				if ( outSteps.features ) {
					outputData.features = outSteps.features;
				}
				if ( outSteps.login ) {
					outputData.login = outSteps.login;
				}
				if ( step.count ) {
					outSteps = outSteps.slice( 0, step.count );
				}
			} else {
				outSteps.push( step );
			}
			for ( let i = 0; i < outSteps.length; i++ ) {
				if ( typeof outSteps[ i ] !== 'object' ) {
					continue;
				}
				if ( typeof outSteps[ i ].queryParams === 'object' ) {
					for ( j in outSteps[ i ].queryParams ) {
						if ( 'gh-ensure-auth' === j ) {
							useBlueprintURLParam = true;
						}
						queries.push( j + '=' + encodeURIComponent( outSteps[ i ].queryParams[ j ] ) );
					}
					delete outSteps[ i ].queryParams;
				}
				Object.keys( step.vars ).forEach( function ( key ) {
					for ( j in outSteps[ i ] ) {
						if ( typeof outSteps[ i ][ j ] === 'object' ) {
							Object.keys( outSteps[ i ][ j ] ).forEach( function ( k ) {
								if ( typeof outSteps[ i ][ j ][ k ] === 'string' && outSteps[ i ][ j ][ k ].includes( '${' + key + '}' ) ) {
									outSteps[ i ][ j ][ k ] = outSteps[ i ][ j ][ k ].replace( '${' + key + '}', step.vars[ key ] );
								}
							} );
						} else if ( typeof outSteps[ i ][ j ] === 'string' && outSteps[ i ][ j ].includes( '${' + key + '}' ) ) {
							outSteps[ i ][ j ] = outSteps[ i ][ j ].replace( '${' + key + '}', step.vars[ key ] );
						}
					}
				} );
				// remove unnecessary whitespace
				for ( j in outSteps[ i ] ) {
					if ( typeof outSteps[ i ][ j ] === 'string' ) {
						outSteps[ i ][ j ] = outSteps[ i ][ j ].replace( /^\s+/g, '' ).replace( /\s+$/g, '' ).replace( /\n\s+/g, '\n' );
					} else if ( typeof outSteps[ i ][ j ] === 'object' ) {
						Object.keys( outSteps[ i ][ j ] ).forEach( function ( k ) {
							if ( typeof outSteps[ i ][ j ][ k ] === 'string' ) {
								outSteps[ i ][ j ][ k ] = outSteps[ i ][ j ][ k ].replace( /^\s+/g, '' ).replace( /\s+$/g, '' ).replace( /\n\s+/g, '\n' );
							}
						} );
					}
				}
			}

			if ( outSteps ) {
				for ( let i = 0; i < outSteps.length; i++ ) {
					// Dedup by default. Prevent by specifying dedup: false as a step parameter.
					if ( outSteps[ i ].dedup === undefined || outSteps[ i ].dedup || outSteps[ i ].dedup === 'last' ) {
						let dedupIndex = -1;
						const dedupStep = outputData.steps.find( function ( step, index ) {
							for ( j in step ) {
								if ( outSteps[ i ][ j ] === undefined ) {
									return false;
								}
								if ( typeof step[ j ] === 'object' ) {
									if ( JSON.stringify( step[ j ] ) !== JSON.stringify( outSteps[ i ][ j ] ) ) {
										return false;
									}
								} else if ( step[ j ] !== outSteps[ i ][ j ] ) {
									return false;
								}
							}
							dedupIndex = index;
							return true;
						} );
						if ( outSteps[ i ].dedup === 'last' && dedupIndex ) {
							delete outputData.steps[ dedupIndex ];
						} else if ( dedupStep ) {
							continue;
						}
						delete outSteps[ i ].dedup;
					}
					outputData.steps.push( outSteps[ i ] );
				}
			}


		} );

		if ( outputData.landingPage === '/' ) {
			delete outputData.landingPage;
		}

		if ( Object.keys( outputData.features ).length === 0 ) {
			delete outputData.features;
		}

		if ( outputData.steps.length === 0 ) {
			delete outputData.steps;
		}

		document.getElementById( 'blueprint-compiled' ).value = JSON.stringify( outputData, null, 2 );

		if ( document.getElementById( 'networking' ).checked ) {
			queries.push( 'networking=yes' );
		}
		if ( document.getElementById( 'autosave' ).value ) {
			queries.push( 'site-slug=' + encodeURIComponent( document.getElementById( 'autosave' ).value.replace( /[^a-z0-9-]/gi, '' ) ) );
			queries.push( 'if-stored-site-missing=prompt' );
		}

		switch ( document.getElementById( 'mode' ).value ) {
			case 'browser':
				queries.push( 'mode=browser' );
				break;
			case 'seamless':
				queries.push( 'mode=seamless' );
				break;
		}
		switch ( document.getElementById( 'storage' ).value ) {
			case 'browser':
				queries.push( 'storage=browser' );
				break;
			case 'device':
				queries.push( 'storage=device' );
				break;
		}
		let hash = '#' + ( JSON.stringify( outputData ).replace( /%/g, '%25' ) );
		if ( hash.includes( ' ' ) || hash.includes( '<' ) || hash.includes( '>' ) ) {
			useBlueprintURLParam = true;
		}
		if ( useBlueprintURLParam || document.getElementById( 'base64' ).checked ) {
			// queries.push( 'blueprint-url=data:application/json;charset=utf-8,' + encodeURIComponent( JSON.stringify( outputData ) ) );
			queries.push( 'blueprint-url=data:application/json;base64,' + encodeURIComponent( encodeStringAsBase64( JSON.stringify( outputData ) ) ) );
			hash = '';
		}
		const query = ( queries.length ? '?' + queries.join( '&' ) : '' );
		const href = 'https://playground.wordpress.net/' + query + hash;
		document.getElementById( 'playground-link' ).href = href;
		document.getElementById( 'playground-link-top' ).href = href;
		document.getElementById( 'download-blueprint' ).href = 'data:text/json;charset=utf-8,' + encodeURIComponent( document.getElementById( 'blueprint-compiled' ).value );
	}

	function restoreState( state ) {
		if ( !state ) {
			return;
		}
		if ( state.title ) {
			document.getElementById( 'title' ).value = state.title;
		}
		if ( state.networking ) {
			document.getElementById( 'networking' ).checked = true;
		}
		if ( state.autosave ) {
			document.getElementById( 'autosave' ).value = state.autosave;
		}
		blueprintSteps.innerHTML = '';
		( state.steps || [] ).forEach( function ( step ) {
			if ( typeof step.step === 'undefined' ) {
				if ( typeof step.title === 'string' ) {
					document.getElementById( 'title' ).value = step.title;
				}
				if ( typeof step.networking === 'boolean' ) {
					document.getElementById( 'networking' ).checked = true;
				}
				return;
			}
			let possibleBlocks = stepList.querySelectorAll( '[data-step="' + step.step + '"]' );
			if ( !possibleBlocks.length ) {
				return;
			}
			if ( possibleBlocks.length > 1 ) {
				const keys = Object.keys( step.vars || {} );
				possibleBlocks = [ ...possibleBlocks ].filter( function ( block ) {
					for ( const key of keys ) {
						const vars = Array.isArray( step.vars[ key ] ) ? step.vars[ key ] : [ step.vars[ key ] ];
						const inputs = block.querySelectorAll( '[name="' + key + '"]' );
						if ( inputs.length !== vars.length ) {
							return false;
						}
						for ( let i = 0; i < inputs.length; i++ ) {
							const input = inputs[ i ];
							const value = vars[ i ];
							if ( 'checkbox' === input.type ) {
								if ( input.checked !== ( value === 'true' || value === true ) ) {
									return false;
								}
							} else if ( input.value !== value ) {
								return false;
							}
						}
					}
					return true;
				} );
				if ( 0 === possibleBlocks.length ) {
					possibleBlocks = [ ...stepList.querySelectorAll( '[data-step="' + step.step + '"]' ) ].filter( function ( block ) {
						if ( block.classList.contains( 'mine' ) ) {
							return false;
						}
						return true;
					} );
				}
			}
			const block = possibleBlocks[ 0 ];
			const stepBlock = block.cloneNode( true );
			stepBlock.classList.remove( 'dragging' );
			blueprintSteps.appendChild( stepBlock );
			stepBlock.querySelectorAll( 'input,textarea' ).forEach( fixMouseCursor );
			if ( step.count ) {
				stepBlock.querySelector( '[name="count"]' ).value = step.count;
			}
			Object.keys( step.vars || {} ).forEach( function ( key ) {
				if ( key === 'step' ) {
					return;
				}
				const input = stepBlock.querySelector( '[name="' + key + '"]' );
				if ( Array.isArray( step.vars[ key ] ) ) {
					step.vars[ key ].forEach( function ( value, index ) {
						if ( !value ) {
							return;
						}
						const inputs = stepBlock.querySelectorAll( '[name="' + key + '"]' );
						if ( typeof inputs[ index ] === 'undefined' ) {
							const vars = stepBlock.querySelector( '.vars' );
							const clone = vars.cloneNode( true );
							vars.parentNode.appendChild( clone );
						}
						const input = stepBlock.querySelectorAll( '[name="' + key + '"]' )[ index ];
						if ( 'checkbox' === input.type ) {
							input.checked = value === 'true' || value === true;
						} else {
							input.value = value;
						}
					} );
					return;
				}

				if ( 'checkbox' === input.type ) {
					input.checked = step.vars[ key ] === 'true' || step.vars[ key ] === true;
				} else {
					input.value = step.vars[ key ];
				}
			} );
		} );
		loadCombinedExamples();
	}
	if ( location.hash ) {
		restoreState( uncompressState( location.hash.slice( 1 ) ) );
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
					'filename': 'to-do-mvc.zip '
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
					'plugin': 'activitypub',
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
		]
	};

	Object.keys( examples ).forEach( function ( example ) {
		const option = document.createElement( 'option' );
		option.value = example;
		option.innerText = example;
		document.getElementById( 'examples' ).appendChild( option );
	} );
	document.getElementById( 'examples' ).addEventListener( 'change', function () {
		if ( 'Examples' === this.value ) {
			return;
		}
		document.getElementById( 'title' ).value = this.value;
		restoreState( { steps: examples[ this.value ] } );
		loadCombinedExamples();
	} );
	document.getElementById( 'filter' ).value = '';
} );
