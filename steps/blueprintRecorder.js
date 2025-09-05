import { githubPlugin } from './githubPlugin.js';

export function blueprintRecorder ( step ) {
	return githubPlugin( {
		vars: {
			url: "https://github.com/akirk/blueprint-recorder",
			branch: "main",
		}
	} );
};
blueprintRecorder.description = "Record steps made and compile a new blueprint.";
