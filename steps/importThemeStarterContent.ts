import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface ImportThemeStarterContentStep extends BlueprintStep {
	themeSlug?: string;
}

export const importThemeStarterContent: StepFunction<ImportThemeStarterContentStep> = ( step: ImportThemeStarterContentStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'importThemeStarterContent',
					themeSlug: step.themeSlug
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

importThemeStarterContent.description = 'The step identifier.';
importThemeStarterContent.hidden = true;
importThemeStarterContent.vars = [
	{
		name: 'themeSlug',
		description: 'The name of the theme to import content from.',
	}
];
