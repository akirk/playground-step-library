/**
 * URL and Sharing Controller
 * Generates URLs for sharing blueprints and handles clipboard operations
 */

import { minimalEncode, shortenUrl, isDefaultValue } from './utils';
import { StepDefinition } from './types';

export interface URLControllerDependencies {
	blueprintSteps: HTMLElement;
	customSteps: Record<string, StepDefinition>;
}

/**
 * Generate a redirect URL with blueprint steps encoded as query parameters
 */
export function generateRedirectUrl(
	delay: number = 1,
	includeRedir: boolean = true,
	deps: URLControllerDependencies
): string | null {
	const steps = deps.blueprintSteps.querySelectorAll('.step');

	if (steps.length === 0) {
		return null;
	}

	const params: string[] = [];
	if (includeRedir) {
		params.push('redir=' + delay);
	}

	steps.forEach((stepElement, index) => {
		const stepName = (stepElement as HTMLElement).dataset.step;
		params.push(`step[${index}]=` + stepName);

		const inputs = stepElement.querySelectorAll('input, textarea, select');
		inputs.forEach(input => {
			const varName = (input as HTMLInputElement).name;
			if (varName) {
				let value: string;
				if ((input as HTMLInputElement).type === 'checkbox') {
					if ((input as HTMLInputElement).checked) {
						value = 'true';
					} else {
						return;
					}
				} else {
					value = (input as HTMLInputElement).value;
				}
				if (!isDefaultValue(stepName || '', varName, value, deps.customSteps)) {
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

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (!navigator.clipboard) {
		// Fallback for older browsers
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		try {
			const success = document.execCommand('copy');
			document.body.removeChild(textarea);
			return success;
		} catch (err) {
			console.error('execCommand failed:', err);
			document.body.removeChild(textarea);
			return false;
		}
	} else {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch (err) {
			console.error('Clipboard write failed:', err);
			return false;
		}
	}
}

/**
 * Share URL using Web Share API if available, otherwise copy to clipboard
 */
export async function shareUrl(url: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
	if (navigator.share) {
		try {
			await navigator.share({
				title: title,
				url: url
			});
			return 'shared';
		} catch (err) {
			// AbortError means user cancelled, not a real error
			if ((err as Error).name === 'AbortError') {
				return 'failed';
			}
			// Fall back to clipboard
			console.error('Share failed, falling back to copy:', err);
		}
	}

	// Fallback to clipboard
	const success = await copyToClipboard(url);
	return success ? 'copied' : 'failed';
}

/**
 * Initialize dropdown menu behavior for a container
 */
export function initMoreOptionsDropdown(container: HTMLElement): void {
	const button = container.querySelector('.more-options-button');
	const menu = container.querySelector('.more-options-menu');

	if (!button || !menu) {
		return;
	}

	button.addEventListener('click', function (e) {
		e.stopPropagation();
		const isVisible = (menu as HTMLElement).style.display === 'block';
		// Close all other dropdowns
		document.querySelectorAll('.more-options-menu').forEach(m => {
			if (m !== menu) {
				(m as HTMLElement).style.display = 'none';
			}
		});
		(menu as HTMLElement).style.display = isVisible ? 'none' : 'block';
	});
}

/**
 * Setup global click handler to close dropdowns when clicking outside
 */
export function setupDropdownCloseHandler(): void {
	document.addEventListener('click', function (e) {
		document.querySelectorAll('.more-options-menu').forEach(menu => {
			const container = (menu as HTMLElement).closest('.more-options-dropdown');
			const button = container?.querySelector('.more-options-button');
			if (button && !(menu as HTMLElement).contains(e.target as Node) && !button.contains(e.target as Node)) {
				(menu as HTMLElement).style.display = 'none';
			}
		});
	});
}
