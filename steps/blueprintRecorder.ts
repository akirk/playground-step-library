import type { StepFunction, BlueprintRecorderStep } from './types.js';
import { githubPlugin } from './githubPlugin.js';

export const blueprintRecorder: StepFunction<BlueprintRecorderStep> = (step: BlueprintRecorderStep) => {
	return githubPlugin( {
		step: 'githubPlugin',
		url: "https://github.com/akirk/blueprint-recorder",
		branch: "main",
	} );
};

blueprintRecorder.description = "Record steps made and compile a new blueprint.";