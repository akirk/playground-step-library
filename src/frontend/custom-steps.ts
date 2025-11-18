/**
 * Custom Steps (My Steps)
 * Manage user-created custom steps stored in localStorage
 */

import { StepDefinition } from './types';

const MY_STEPS_STORAGE_KEY = 'mySteps';

/**
 * Get all custom steps from localStorage
 */
export function getMySteps(): Record<string, StepDefinition> {
	try {
		return JSON.parse(localStorage.getItem(MY_STEPS_STORAGE_KEY) || '{}');
	} catch (e) {
		console.error('Failed to load custom steps:', e);
		return {};
	}
}

/**
 * Save a custom step to localStorage
 */
export function saveMyStep(name: string, stepDefinition: StepDefinition): void {
	const mySteps = getMySteps();
	mySteps[name] = stepDefinition;
	localStorage.setItem(MY_STEPS_STORAGE_KEY, JSON.stringify(mySteps));
}

/**
 * Delete a custom step from localStorage
 */
export function deleteMyStep(name: string): void {
	const mySteps = getMySteps();
	delete mySteps[name];
	localStorage.setItem(MY_STEPS_STORAGE_KEY, JSON.stringify(mySteps));
}

/**
 * Rename a custom step in localStorage
 */
export function renameMyStep(oldName: string, newName: string): boolean {
	const mySteps = getMySteps();

	if (!mySteps[oldName]) {
		return false;
	}

	if (mySteps[newName]) {
		return false; // New name already exists
	}

	mySteps[newName] = mySteps[oldName];
	delete mySteps[oldName];
	localStorage.setItem(MY_STEPS_STORAGE_KEY, JSON.stringify(mySteps));
	return true;
}

/**
 * Check if a custom step name exists
 */
export function myStepExists(name: string): boolean {
	const mySteps = getMySteps();
	return name in mySteps;
}

/**
 * Import personal steps from data object
 */
export function importMySteps(stepsData: Record<string, StepDefinition>, merge: boolean = true): number {
	const currentSteps = merge ? getMySteps() : {};
	const importedSteps = { ...currentSteps, ...stepsData };
	localStorage.setItem(MY_STEPS_STORAGE_KEY, JSON.stringify(importedSteps));
	return Object.keys(stepsData).length;
}

/**
 * Clear all personal steps
 */
export function clearMySteps(): void {
	localStorage.removeItem(MY_STEPS_STORAGE_KEY);
}
