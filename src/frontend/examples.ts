/**
 * Blueprint Examples
 * Pre-defined step configurations for common use cases
 * Examples are loaded from individual JSON files in /examples/
 */

export interface ExampleStep {
	step: string;
	vars: Record<string, any>;
}

export interface ExampleState {
	steps: ExampleStep[];
	extraLibraries?: string[];
}

export type Examples = Record<string, ExampleState>;

interface ExampleModule {
	meta: {
		title: string;
	};
	steps: ExampleStep[];
	extraLibraries?: string[];
}

const exampleModules = import.meta.glob<ExampleModule>( '/src/examples/*.json', { eager: true } );

export const examples: Examples = {};

for ( const path in exampleModules ) {
	const module = exampleModules[path];
	if ( module.meta && module.meta.title ) {
		const exampleState: ExampleState = {
			steps: module.steps
		};
		if ( module.extraLibraries ) {
			exampleState.extraLibraries = module.extraLibraries;
		}
		examples[module.meta.title] = exampleState;
	}
}
