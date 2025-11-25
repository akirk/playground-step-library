/**
 * Dialog for resolving local paths in wp-env.json imports
 * Used by both paste handler and file drop controller
 */

export interface ResolvedStep {
	step: 'installPlugin' | 'installTheme';
	vars: { url: string };
}

/**
 * Shows a dialog prompting the user to provide URLs for unresolved local paths
 * @param unresolvedPlugins - List of local plugin paths (e.g., '.', './local-plugin')
 * @param unresolvedThemes - List of local theme paths
 * @returns Array of resolved steps, empty array if skipped, or null if cancelled
 */
export function showUnresolvedDialog(
	unresolvedPlugins: string[],
	unresolvedThemes: string[]
): Promise<ResolvedStep[] | null> {
	return new Promise( ( resolve ) => {
		const dialog = document.getElementById( 'wpenv-unresolved-dialog' ) as HTMLDialogElement;
		const itemsContainer = document.getElementById( 'wpenv-unresolved-items' )!;
		const importBtn = document.getElementById( 'wpenv-unresolved-import' )!;
		const skipBtn = document.getElementById( 'wpenv-unresolved-skip' )!;
		const cancelBtn = document.getElementById( 'wpenv-unresolved-cancel' )!;

		while ( itemsContainer.firstChild ) {
			itemsContainer.removeChild( itemsContainer.firstChild );
		}

		const inputs: Array<{ type: 'plugin' | 'theme'; path: string; input: HTMLInputElement }> = [];

		const handleInputKeydown = ( e: KeyboardEvent ) => {
			if ( e.key === 'Enter' ) {
				e.preventDefault();
				e.stopPropagation();
				importBtn.click();
			}
		};

		for ( const path of unresolvedPlugins ) {
			const label = document.createElement( 'label' );
			const strong = document.createElement( 'strong' );
			strong.textContent = 'Plugin: ';
			label.appendChild( strong );
			const code = document.createElement( 'code' );
			code.textContent = 'plugins: [ "' + path + '" ]';
			label.appendChild( code );
			label.appendChild( document.createElement( 'br' ) );
			const input = document.createElement( 'input' );
			input.type = 'text';
			input.placeholder = 'Enter plugin URL or WordPress.org slug (leave empty to skip)';
			input.style.width = '100%';
			input.style.marginBottom = '10px';
			input.addEventListener( 'keydown', handleInputKeydown );
			label.appendChild( input );
			itemsContainer.appendChild( label );
			inputs.push( { type: 'plugin', path, input } );
		}

		for ( const path of unresolvedThemes ) {
			const label = document.createElement( 'label' );
			const strong = document.createElement( 'strong' );
			strong.textContent = 'Theme: ';
			label.appendChild( strong );
			const code = document.createElement( 'code' );
			code.textContent = 'themes: [ "' + path + '" ]';
			label.appendChild( code );
			label.appendChild( document.createElement( 'br' ) );
			const input = document.createElement( 'input' );
			input.type = 'text';
			input.placeholder = 'Enter theme URL or WordPress.org slug (leave empty to skip)';
			input.style.width = '100%';
			input.style.marginBottom = '10px';
			input.addEventListener( 'keydown', handleInputKeydown );
			label.appendChild( input );
			itemsContainer.appendChild( label );
			inputs.push( { type: 'theme', path, input } );
		}

		const cleanup = () => {
			importBtn.removeEventListener( 'click', onImport );
			skipBtn.removeEventListener( 'click', onSkip );
			cancelBtn.removeEventListener( 'click', onCancel );
			dialog.close();
		};

		const onImport = () => {
			const steps: ResolvedStep[] = [];
			for ( const { type, input } of inputs ) {
				const url = input.value.trim();
				if ( url ) {
					steps.push( {
						step: type === 'plugin' ? 'installPlugin' : 'installTheme',
						vars: { url }
					} );
				}
			}
			cleanup();
			resolve( steps );
		};

		const onSkip = () => {
			cleanup();
			resolve( [] );
		};

		const onCancel = () => {
			cleanup();
			resolve( null );
		};

		importBtn.addEventListener( 'click', onImport );
		skipBtn.addEventListener( 'click', onSkip );
		cancelBtn.addEventListener( 'click', onCancel );

		dialog.showModal();
	} );
}
