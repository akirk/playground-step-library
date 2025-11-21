import type { StepFunction, ImportWxrFromUrlStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';


export const importWxr: StepFunction<ImportWxrFromUrlStep> = (step: ImportWxrFromUrlStep): StepResult => {
	return {
		toV1() {
			if ( ! step.url || ! step.url.match( /^https?:/ ) ) {
				return { steps: [] };
			}
			return {
				steps: [
					{
						"step": "importWxr",
						"file": {
							"resource": "url",
							"url": step.url
						}
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

importWxr.description = "Import a WXR from a URL.";
importWxr.builtin = true;
importWxr.vars = [
	{
		name: "url",
		description: "URL of a WXR file",
		required: true,
		samples: [ "" ]
	}
];