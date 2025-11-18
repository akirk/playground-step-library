/**
 * Playground Integration
 * Handles parsing playground URLs and query API format
 */

import { isPlaygroundDomain } from './content-detection';

export function parsePlaygroundQueryApi(url: string): any {
	if (!url || typeof url !== 'string') {
		return null;
	}

	try {
		const urlObj = new URL(url.trim());
		if (!isPlaygroundDomain(urlObj.hostname)) {
			return null;
		}

		const params = urlObj.searchParams;
		const blueprint: any = {};

		if (params.has('php')) {
			blueprint.phpExtensionBundles = [params.get('php')];
		}

		if (params.has('wp')) {
			blueprint.preferredVersions = { wp: params.get('wp') };
		}

		if (params.has('multisite')) {
			const value = params.get('multisite');
			if (value === 'yes' || value === 'true' || value === '1') {
				blueprint.features = { networking: true };
			}
		}

		if (params.has('login')) {
			const value = params.get('login');
			if (value === 'yes' || value === 'true' || value === '1') {
				blueprint.login = true;
			}
		}

		const steps = [];

		const plugins = params.getAll('plugin');
		for (const plugin of plugins) {
			steps.push({
				step: 'installPlugin',
				pluginData: { resource: 'wordpress.org/plugins', slug: plugin }
			});
		}

		const themes = params.getAll('theme');
		for (const theme of themes) {
			steps.push({
				step: 'installTheme',
				themeData: { resource: 'wordpress.org/themes', slug: theme }
			});
		}

		if (params.has('gutenberg-pr')) {
			const pr = params.get('gutenberg-pr');
			steps.push({
				step: 'installPlugin',
				pluginData: {
					resource: 'url',
					url: `https://plugin-proxy.wordpress.net/gutenberg/gutenberg-build-pr-${pr}.zip`
				}
			});
		}

		if (params.has('core-pr')) {
			const pr = params.get('core-pr');
			steps.push({
				step: 'runPHP',
				code: `<?php require '/wordpress/wp-load.php'; wp_install_core_pr(${pr});`
			});
		}

		if (steps.length > 0) {
			blueprint.steps = steps;
		}

		if (params.has('url')) {
			blueprint.landingPage = params.get('url');
		}

		if (params.has('mode')) {
			const mode = params.get('mode');
			if (mode === 'seamless') {
				blueprint.preferredVersions = blueprint.preferredVersions || {};
				blueprint.preferredVersions.seamless = true;
			}
		}

		if (params.has('language')) {
			blueprint.siteOptions = blueprint.siteOptions || {};
			blueprint.siteOptions.WPLANG = params.get('language');
		}

		return blueprint;
	} catch (e) {
		console.error('Error parsing Query API URL:', e);
		return null;
	}
}

export function shouldUseMuPlugin(phpCode: string): boolean {
	const hookIndicators = [
		'add_action(',
		'add_filter(',
		'remove_action(',
		'remove_filter(',
		'register_post_type(',
		'register_taxonomy(',
		'add_shortcode('
	];

	return hookIndicators.some(indicator => phpCode.includes(indicator));
}
