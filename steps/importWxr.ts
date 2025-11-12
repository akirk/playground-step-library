import type { StepFunction, ImportWxrFromUrlStep} from './types.js';


export const importWxr: StepFunction<ImportWxrFromUrlStep> = (step: ImportWxrFromUrlStep) => {
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
};

importWxr.description = "Import a WXR from a URL.";
importWxr.builtin = true;
importWxr.vars = Object.entries({
	url: {
		description: "URL of a WXR file",
		required: true,
		samples: [ "" ]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));