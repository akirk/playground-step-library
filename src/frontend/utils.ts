import { StepDefinition } from './types';

export function minimalEncode(str: string): string {
	return str
		.replace(/%/g, '%25')
		.replace(/&/g, '%26')
		.replace(/=/g, '%3D')
		.replace(/#/g, '%23')
		.replace(/\?/g, '%3F')
		.replace(/\s/g, '%20');
}

export function shortenUrl(url: string): string {
	return url.replace(/^https?:\/\//, '');
}

export function expandUrl(url: string): string {
	if (!url.match(/^https?:\/\//)) {
		return 'https://' + url;
	}
	return url;
}

export function isDefaultValue(stepName: string, varName: string, value: any, customSteps: Record<string, StepDefinition>): boolean {
	if (!value || value === '') {
		return true;
	}
	if (value === 'false') {
		return true;
	}

	const stepDef = customSteps[stepName];
	if (stepDef && stepDef.vars) {
		const varDef = stepDef.vars.find(v => v.name === varName);

		if (varDef) {
			let defaultVal: any = null;

			if (varDef.samples && varDef.samples.length > 0) {
				defaultVal = varDef.samples[0];
			} else if (varDef.type === 'boolean') {
				defaultVal = 'false';
			} else {
				return false;
			}

			if (typeof defaultVal === 'boolean') {
				return value === defaultVal.toString();
			}
			return value == defaultVal;
		}
	}

	return false;
}

export function encodeStringAsBase64(str: string): string {
	return encodeUint8ArrayAsBase64(new TextEncoder().encode(str));
}

export function encodeUint8ArrayAsBase64(bytes: Uint8Array): string {
	const binString = String.fromCodePoint(...bytes);
	return btoa(binString);
}

export function decodeBase64ToString(base64: string): string {
	return new TextDecoder().decode(decodeBase64ToUint8Array(base64));
}

export function decodeBase64ToUint8Array(base64: string): Uint8Array {
	const binaryString = window.atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

export function generateLabel(): string {
	const now = new Date();
	return now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
