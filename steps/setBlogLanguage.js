customSteps.setBlogLanguage = async function( step, blueprint ) {
	const lang = step?.vars?.language;
	if ( ! lang ) {
		return [];
	}
	const localeMapping = {
		"de": "de_DE",
		"fr": "fr_FR",
		"es": "es_ES",
		"it": "it_IT",
		"ja": "ja_JA",
		"pl": "pl_PL",
		"ar": "ar"
	};
	const wp_locale = localeMapping[lang] || lang;

	const steps = [
		{
			step: 'mkdir',
			path: '/wordpress/wp-content/languages',
		},
		{
			step: "writeFile",
			path: `/wordpress/wp-content/languages/${wp_locale}.mo`,
			data: {
				resource: "url",
				caption: `Downloading ${wp_locale}.mo`,
				url: `https://translate.wordpress.org/projects/wp/dev/${lang}/default/export-translations?format=mo`
			}
		},
		{
			step: "writeFile",
			path: `/wordpress/wp-content/languages/admin-${wp_locale}.mo`,
			data: {
				resource: "url",
				caption: `Downloading admin-${wp_locale}.mo`,
				url: `https://translate.wordpress.org/projects/wp/dev/admin/${lang}/default/export-translations?format=mo`
			}
		}
	];
	const plugins = [];
	const themes = [];
	for ( let = i = 0; i < blueprint.steps.length; i++ ) {
		if ( blueprint.steps[i].step === 'installPlugin' ) {
			plugins.push( blueprint.steps[i].vars.plugin );
		} else if ( blueprint.steps[i].step === 'installTheme' ) {
			themes.push( blueprint.steps[i].vars.theme );
		}
	}
	if ( plugins.length ) {
		steps.push({
			step: 'mkdir',
			path: '/wordpress/wp-content/languages/plugins',
		});
	}
	if ( themes.length ) {
		steps.push({
			step: 'mkdir',
			path: '/wordpress/wp-content/languages/themes',
		});
	}

	const files = {};
	for ( let = i = 0; i < plugins.length; i++ ) {
		let plugin = plugins[i];
		// TODO: Could we also use language packs?
		files[`/wordpress/wp-content/languages/plugins/${plugin}-${wp_locale}.mo`] = `https://translate.wordpress.org/projects/wp-plugins/${plugin}/dev/${lang}/default/export-translations?format=mo`;
	}
	for ( let = i = 0; i < themes.length; i++ ) {
		let theme = themes[i];
		files[`/wordpress/wp-content/languages/themes/${theme}-${wp_locale}.mo`] = `https://translate.wordpress.org/projects/wp-themes/${theme}/dev/${lang}/default/export-translations?format=mo`;
	}

	for ( let file in files ) {
		let basename = file.split('/').pop();
		steps.push({
			step: "writeFile",
			path: file,
			data: {
				resource: "url",
				caption: `Downloading ${basename}`,
				url: files[file]
			}
		});
	}

	steps.push( {
		step: 'setSiteOptions',
		options: {
			WPLANG: wp_locale,
		}
	} );
	return steps;
};
customSteps.setBlogLanguage.vars = [
	{
		"name": "language",
		"description": "A valid WordPress language slug",
		"required": true,
		"samples": [ "de", "fr", "es", "it", "pl", "ar" ]
	}
];
