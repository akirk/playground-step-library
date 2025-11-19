import type { StepFunction, BlueprintExtractorStep , StepResult, V2SchemaFragments } from './types.js';
import { githubPlugin } from './githubPlugin.js';

export const blueprintExtractor: StepFunction<BlueprintExtractorStep> = (step: BlueprintExtractorStep): StepResult => {
	return {
		toV1() {
	return githubPlugin( {
		step: 'githubPlugin',
		url: "https://github.com/akirk/blueprint-extractor",
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

blueprintExtractor.description = "Generate a new blueprint after modifying the WordPress.";