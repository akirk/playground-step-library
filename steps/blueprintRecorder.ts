import type { StepFunction, BlueprintRecorderStep , StepResult, V2SchemaFragments } from './types.js';
import { githubPlugin } from './githubPlugin.js';

export const blueprintRecorder: StepFunction<BlueprintRecorderStep> = (step: BlueprintRecorderStep): StepResult => {
	return {
		toV1() {
	return githubPlugin( {
		step: 'githubPlugin',
		url: "https://github.com/akirk/blueprint-recorder",
		branch: "main",
	} ).toV1();
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
			};
		}
	};
};

blueprintRecorder.description = "Record steps made and compile a new blueprint.";