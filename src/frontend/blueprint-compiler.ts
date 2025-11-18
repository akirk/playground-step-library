/**
 * Blueprint Compiler Utilities
 * Functions for compressing/encoding blueprint state
 */

import { encodeStringAsBase64, decodeBase64ToString } from './utils';

export interface StepConfig {
	step: string;
	vars?: Record<string, any>;
	count?: number;
}

export interface CompressedState {
	steps: StepConfig[];
	title?: string;
	autosave?: string;
	playground?: string;
	mode?: string;
	previewMode?: string;
	excludeMeta?: boolean;
	wpVersion?: string;
	phpVersion?: string;
	blueprintVersion?: string;
}

/**
 * Compress step configuration and options into a base64 string
 */
export function compressState(
	steps: StepConfig[],
	options: {
		title?: string;
		autosave?: string;
		playground?: string;
		mode?: string;
		previewMode?: string;
		excludeMeta?: boolean;
		wpVersion?: string;
		phpVersion?: string;
		blueprintVersion?: string;
	}
): string {
	const state: CompressedState = {
		steps
	};

	if (options.title) {
		state.title = options.title;
	}
	if (options.autosave) {
		state.autosave = options.autosave;
	}
	if (options.playground && options.playground !== 'playground.wordpress.net') {
		state.playground = options.playground;
	}
	if (options.mode && options.mode !== 'browser-full-screen') {
		state.mode = options.mode;
	}
	if (options.previewMode) {
		state.previewMode = options.previewMode;
	}
	if (options.excludeMeta) {
		state.excludeMeta = true;
	}
	if (options.wpVersion && options.wpVersion !== 'latest') {
		state.wpVersion = options.wpVersion;
	}
	if (options.phpVersion && options.phpVersion !== 'latest') {
		state.phpVersion = options.phpVersion;
	}
	if (options.blueprintVersion && options.blueprintVersion !== 'v1') {
		state.blueprintVersion = options.blueprintVersion;
	}

	const json = JSON.stringify(state);

	if (json === '{"steps":[]}') {
		return '';
	}
	return encodeStringAsBase64(json);
}

/**
 * Uncompress base64 state back into step configuration
 */
export function uncompressState(state: string): CompressedState {
	try {
		return JSON.parse(decodeBase64ToString(state));
	} catch {
		return { steps: [] };
	}
}

/**
 * Extract step data from a DOM element
 */
export function extractStepDataFromElement(stepBlock: Element): StepConfig {
	const step: StepConfig = {
		step: (stepBlock as HTMLElement).dataset.step || '',
		vars: {}
	};

	stepBlock.querySelectorAll('input,select,textarea').forEach(function (input) {
		const inputEl = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

		if (inputEl.name === 'count') {
			step.count = parseInt((inputEl as HTMLInputElement).value);
			return;
		}

		if (typeof step.vars![inputEl.name] !== 'undefined') {
			if (!Array.isArray(step.vars![inputEl.name])) {
				step.vars![inputEl.name] = [step.vars![inputEl.name]];
			}
			if ((inputEl as HTMLInputElement).type === 'checkbox') {
				step.vars![inputEl.name].push((inputEl as HTMLInputElement).checked);
			} else {
				step.vars![inputEl.name].push(inputEl.value);
			}
		} else {
			if ((inputEl as HTMLInputElement).type === 'checkbox') {
				step.vars![inputEl.name] = (inputEl as HTMLInputElement).checked;
			} else {
				step.vars![inputEl.name] = inputEl.value;
			}
		}
	});

	if (!Object.keys(step.vars!).length) {
		delete step.vars;
	}

	return step;
}
