import { ShowCallbacks } from './types';

/**
 * Shared application state
 * This module holds global state that needs to be accessed across multiple modules
 */

export let blueprint = '';
export let linkedTextarea: HTMLTextAreaElement | null = null;
export const showCallbacks: ShowCallbacks = {};
export const isManualEditMode = { value: false };

export function setBlueprint(value: string): void {
	blueprint = value;
}

export function setLinkedTextarea(textarea: HTMLTextAreaElement | null): void {
	linkedTextarea = textarea;
}

export function getBlueprint(): string {
	return blueprint;
}

export function getLinkedTextarea(): HTMLTextAreaElement | null {
	return linkedTextarea;
}
