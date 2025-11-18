/**
 * Blueprint UI Renderer
 * Handles blueprint display, preview modes, and size warnings
 */

export interface BlueprintUIDependencies {
	playgroundIframe: HTMLIFrameElement;
}

/**
 * Update the blueprint size warning when the blueprint is large
 */
export function updateBlueprintSizeWarning(href: string): void {
	const warningElement = document.getElementById('blueprint-size-warning');
	if (!warningElement) return;

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

/**
 * Handle split view mode (bottom or right preview)
 */
export function handleSplitViewMode(href: string, deps: BlueprintUIDependencies): void {
	const previewModeEl = document.getElementById('preview-mode') as HTMLSelectElement;
	if (!previewModeEl) return;

	const previewMode = previewModeEl.value;
	const body = document.body;
	const iframe = deps.playgroundIframe;

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

/**
 * Update iframe src with a forced reload
 */
export function updateIframeSrc(iframe: HTMLIFrameElement, newSrc: string): void {
	// Always force reload to ensure the blueprint changes are reflected
	iframe.src = '';
	setTimeout(() => {
		iframe.src = newSrc;
	}, 50);
}
