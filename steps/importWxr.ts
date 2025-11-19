import type { StepFunction, ImportWxrFromUrlStep, StepResult, V2SchemaFragments } from './types.js';


export const importWxr: StepFunction<ImportWxrFromUrlStep> = (step: ImportWxrFromUrlStep): StepResult => {
	return {
		toV1() {
	if ( ! step.url || ! step.url.match( /^https?:/ ) ) {
		return [];
	}
	return [
		{
			"step": "importWxr",
			"file": {
				"resource": "url",
				"url": step.url
			}
		}
	];
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