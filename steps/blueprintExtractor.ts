import type { StepFunction, BlueprintExtractorStep } from './types.js';
import { githubPlugin } from './githubPlugin.js';

export const blueprintExtractor: StepFunction<BlueprintExtractorStep> = (step: BlueprintExtractorStep) => {
	return githubPlugin( {
		step: 'githubPlugin',
		url: "https://github.com/akirk/blueprint-extractor",
		branch: "main",
	} );
};

blueprintExtractor.description = "Generate a new blueprint after modifying the WordPress.";