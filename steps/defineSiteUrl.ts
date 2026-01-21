import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface DefineSiteUrlStep extends BlueprintStep {
	siteUrl: string;
}

export const defineSiteUrl: StepFunction<DefineSiteUrlStep> = ( step: DefineSiteUrlStep ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: 'defineSiteUrl',
					siteUrl: step.siteUrl
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

defineSiteUrl.description = 'Changes the site URL of the WordPress installation.';
defineSiteUrl.hidden = true;
defineSiteUrl.vars = [
	{
		name: 'siteUrl',
		required: true,
	}
];
