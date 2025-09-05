import { githubPlugin } from './githubPlugin.js';

export function blueprintExtractor ( step ) {
	return githubPlugin( {
		vars: {
			url: "https://github.com/akirk/blueprint-extractor",
			branch: "main",
		}
	} );
};
blueprintExtractor.description = "Generate a new blueprint after modifying the WordPress.";
