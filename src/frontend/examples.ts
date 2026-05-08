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
	title: string;
	slug: string;
	steps: ExampleStep[];
	extraLibraries?: string[];
}

export type Examples = Record<string, ExampleState>;
export type ExamplesBySlug = Record<string, ExampleState>;

interface ExampleModule {
	meta: {
		title: string;
	};
	steps: ExampleStep[];
	extraLibraries?: string[];
}

const exampleModules = import.meta.glob<ExampleModule>( '/src/examples/*.json', { eager: true } );

export const examples: Examples = {};
export const examplesBySlug: ExamplesBySlug = {};

function getExampleSlug( path: string ): string {
	return path.split( '/' ).pop()?.replace( /\.json$/, '' ) || path;
}

for ( const path in exampleModules ) {
	const module = exampleModules[path];
	if ( module.meta && module.meta.title ) {
		const slug = getExampleSlug( path );
		const exampleState: ExampleState = {
			title: module.meta.title,
			slug,
			steps: module.steps
		};
		if ( module.extraLibraries ) {
			exampleState.extraLibraries = module.extraLibraries;
		}
		examples[module.meta.title] = exampleState;
		examplesBySlug[slug] = exampleState;
	}
}
