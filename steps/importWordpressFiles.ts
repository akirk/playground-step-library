import type { StepFunction, BlueprintStep, StepResult, FileReference } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface ImportWordPressFilesStep extends BlueprintStep {
	wordPressFilesZip: FileReference;
	pathInZip?: string;
}

export const importWordPressFiles: StepFunction<ImportWordPressFilesStep> = ( step: ImportWordPressFilesStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'importWordPressFiles',
					wordPressFilesZip: step.wordPressFilesZip,
					pathInZip: step.pathInZip
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

importWordPressFiles.description = 'The zip file containing the top-level WordPress files and.';
importWordPressFiles.hidden = true;
importWordPressFiles.vars = [
	{
		name: 'wordPressFilesZip',
		description: 'The zip file containing the top-level WordPress files and',
		required: true,
	},
	{
		name: 'pathInZip',
		description: 'The path inside the zip file where the WordPress files are.',
	}
];
