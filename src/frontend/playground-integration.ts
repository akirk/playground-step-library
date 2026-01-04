/**
 * Playground Integration
 * Handles parsing playground URLs and query API format
 */

import { isPlaygroundDomain } from './content-detection';

export interface ParseResult {
	blueprint: any | null;
	error?: string;
}

export function parsePlaygroundQueryApi( url: string ): ParseResult {
	if (!url || typeof url !== 'string') {
		return { blueprint: null };
	}

	try {
		const urlObj = new URL(url.trim());
		if (!isPlaygroundDomain(urlObj.hostname)) {
			return { blueprint: null };
		}

		const params = urlObj.searchParams;
		console.log( '[parsePlaygroundQueryApi] All query params:', Array.from( params.entries() ) );

		// Handle blueprint-url parameter (data URL with base64-encoded JSON)
		if ( params.has( 'blueprint-url' ) ) {
			const blueprintUrl = params.get( 'blueprint-url' );
			console.log( '[parsePlaygroundQueryApi] Found blueprint-url:', blueprintUrl?.substring( 0, 50 ) );
			if ( blueprintUrl && blueprintUrl.startsWith( 'data:' ) ) {
				// Parse data URL: data:application/json;base64,<base64-data>
				const dataUrlMatch = blueprintUrl.match( /^data:[^;]+;base64,(.+)$/ );
				if ( dataUrlMatch ) {
					try {
						const base64Data = dataUrlMatch[1];
						console.log( '[parsePlaygroundQueryApi] Base64 data length:', base64Data.length );
						let decoded: string;
						try {
							decoded = atob( base64Data );
						} catch ( e ) {
							console.error( '[parsePlaygroundQueryApi] Base64 decode failed:', e );
							return { blueprint: null, error: 'Invalid base64 in blueprint data' };
						}
						console.log( '[parsePlaygroundQueryApi] Decoded length:', decoded.length );
						let parsed: any;
						try {
							parsed = JSON.parse( decoded );
						} catch ( e ) {
							const errorMsg = e instanceof Error ? e.message : String( e );
							console.error( '[parsePlaygroundQueryApi] JSON parse failed:', e );
							return { blueprint: null, error: `Invalid JSON in blueprint: ${errorMsg}` };
						}
						console.log( '[parsePlaygroundQueryApi] Parsed blueprint from data URL, steps:', parsed.steps?.length );
						return { blueprint: parsed };
					} catch ( e ) {
						const errorMsg = e instanceof Error ? e.message : String( e );
						console.error( '[parsePlaygroundQueryApi] Failed to parse blueprint-url data URL:', e );
						return { blueprint: null, error: errorMsg };
					}
				}
			}
			// blueprint-url param exists but couldn't be parsed - don't fall through to query param parsing
			console.log( '[parsePlaygroundQueryApi] blueprint-url param present but not a valid data URL' );
			return { blueprint: null, error: 'Invalid blueprint-url format' };
		}

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

		return { blueprint };
	} catch (e) {
		const errorMsg = e instanceof Error ? e.message : String( e );
		console.error('Error parsing Query API URL:', e);
		return { blueprint: null, error: errorMsg };
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
