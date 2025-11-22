/**
 * State Migration Utilities
 * Handles backward compatibility for blueprint state changes
 */

import { CompressedState, StepConfig } from './blueprint-compiler';

/**
 * Migration rules for variable name changes across different step types
 */
const variableMigrations: Record<string, Record<string, string>> = {
	'addPage': {
		'postTitle': 'title',
		'postContent': 'content'
	},
	'addPost': {
		'postTitle': 'title',
		'postContent': 'content',
		'postDate': 'date',
		'postType': 'type',
		'postStatus': 'status'
	},
	'addProduct': {
		'productTitle': 'title',
		'productDescription': 'description',
		'productPrice': 'price',
		'productSalePrice': 'salePrice',
		'productSku': 'sku',
		'productStatus': 'status'
	}
	// Add more step migrations here as needed
	// 'stepName': {
	//     'oldVarName': 'newVarName'
	// }
};

/**
 * Migrate old state variable names to new names for backward compatibility
 */
export function migrateState(state: CompressedState): CompressedState {
	if (!state || !state.steps) {
		return state;
	}

	// Apply migrations to each step
	state.steps = state.steps.map(function (step) {
		if (!variableMigrations[step.step]) {
			return step;
		}

		const migrations = variableMigrations[step.step];
		const migratedStep: StepConfig = { step: step.step };
		if (step.count) {
			migratedStep.count = step.count;
		}

		// Copy existing properties and apply migrations
		Object.keys(step).filter(k => k !== 'step' && k !== 'count').forEach(function (varName) {
			if (migrations[varName]) {
				// Migrate old variable name to new name
				const newVarName = migrations[varName];
				migratedStep[newVarName] = step[varName];
				console.info('Migrated variable "' + varName + '" to "' + newVarName + '" in step "' + step.step + '"');
			} else {
				// Keep existing variable
				migratedStep[varName] = step[varName];
			}
		});

		return migratedStep;
	});

	return state;
}
