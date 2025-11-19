import type { StepFunction, SetLanguageStep, StepResult, V2SchemaFragments } from './types.js';


export const setLanguage: StepFunction<SetLanguageStep> = (step: SetLanguageStep): StepResult => {
	return {
		toV1() {
	const lang = step.language;
	if (!lang) {
		return [];
	}
	const localeMapping: Record<string, string> = {
		"de": "de_DE",
		"fr": "fr_FR",
		"es": "es_ES",
		"it": "it_IT",
		"ja": "ja",
		"pl": "pl_PL",
		"ar": "ar"
	};
	const wp_locale = localeMapping[lang] || lang;

	const steps = [
		{
			step: 'setSiteLanguage',
			language: wp_locale,
		}
	];
	return steps;
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

setLanguage.description = "Set the WordPress site language.";
setLanguage.vars = [
	{
		name: "language",
		description: "A valid WordPress language slug",
		required: true,
		samples: ["de", "fr", "es", "it", "pl", "ar"]
	}
];