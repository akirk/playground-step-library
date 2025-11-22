/**
 * Step Utilities
 * Shared functions for step manipulation in the blueprint builder
 */

import { StepData } from './types';

/**
 * Clone a step from the library and add it to the blueprint steps container
 */
export function cloneStepToBlueprint( stepName: string, container: HTMLElement ): HTMLElement | null {
	const sourceStep = document.querySelector( '#step-library .step[data-step="' + stepName + '"]' );
	if ( !sourceStep ) {
		console.warn( 'Step not found in library:', stepName );
		return null;
	}

	const stepBlock = sourceStep.cloneNode( true ) as HTMLElement;
	stepBlock.removeAttribute( 'id' );
	stepBlock.classList.remove( 'dragging' );
	stepBlock.classList.remove( 'hidden' );
	container.appendChild( stepBlock );

	return stepBlock;
}

/**
 * Populate a step block with variable values
 */
export function populateStepVariables( stepBlock: HTMLElement, stepData: StepData ): void {
	if ( stepData.vars ) {
		for ( const key in stepData.vars ) {
			const input = stepBlock.querySelector( '[name="' + key + '"]' ) as HTMLInputElement | null;
			if ( input ) {
				if ( input.type === 'checkbox' ) {
					input.checked = stepData.vars[key];
				} else {
					input.value = stepData.vars[key];
				}
			}
		}
	}

	if ( stepData.count ) {
		const countInput = stepBlock.querySelector( '[name="count"]' ) as HTMLInputElement | null;
		if ( countInput ) {
			countInput.value = String( stepData.count );
		}
	}
}

/**
 * Clone a step and populate it with data, returning the step name if it wasn't found
 */
export function createAndPopulateStep( stepData: StepData, container: HTMLElement ): string | null {
	const stepBlock = cloneStepToBlueprint( stepData.step, container );
	if ( !stepBlock ) {
		return stepData.step;
	}
	populateStepVariables( stepBlock, stepData );
	return null;
}

/**
 * Process an array of step data, creating and populating step blocks
 * Returns an array of step names that were not found in the library
 */
export function processSteps( steps: StepData[], container: HTMLElement ): string[] {
	const missingSteps: string[] = [];

	steps.forEach( function ( stepData ) {
		const missing = createAndPopulateStep( stepData, container );
		if ( missing ) {
			missingSteps.push( missing );
		}
	} );

	return missingSteps;
}
