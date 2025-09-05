const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const setLanguage = (step) => {
    const lang = step.language;
    if (!lang) {
        return [];
    }
    const localeMapping = {
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
};
setLanguage.description = "Set the WordPress site language.";
setLanguage.vars = createVarsConfig({
    language: {
        description: "A valid WordPress language slug",
        required: true,
        samples: ["de", "fr", "es", "it", "pl", "ar"]
    }
});
//# sourceMappingURL=setLanguage.js.map