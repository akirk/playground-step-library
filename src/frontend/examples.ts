/**
 * Blueprint Examples
 * Pre-defined step configurations for common use cases
 * Examples are loaded from individual JSON files in /examples/
 */

export interface ExampleStep {
	step: string;
	vars: Record<string, any>;
}

export type Examples = Record<string, ExampleStep[]>;

interface ExampleModule {
	meta: {
		title: string;
	};
	steps: ExampleStep[];
}

const exampleModules = import.meta.glob<ExampleModule>( '/src/examples/*.json', { eager: true } );

export const examples: Examples = {};

for ( const path in exampleModules ) {
	const module = exampleModules[path];
	if ( module.meta && module.meta.title ) {
		examples[module.meta.title] = module.steps;
	}
}
