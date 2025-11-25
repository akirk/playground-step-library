/**
 * Content Detection
 * Functions for detecting different types of content in pasted text
 */

/**
 * Detects the type of URL (plugin, theme, etc.)
 * @param url - The URL to analyze
 * @returns The URL type ('plugin' or 'theme') or null if not recognized
 */
export function detectUrlType(url: string): string | null {
	if (!url || typeof url !== 'string') {
		return null;
	}

	const trimmedUrl = url.trim();

	if (/^https?:\/\/wordpress\.org\/plugins\/.+/.test(trimmedUrl)) {
		return 'plugin';
	}
	if (/^https?:\/\/wordpress\.org\/themes\/.+/.test(trimmedUrl)) {
		return 'theme';
	}
	if (/^https?:\/\/github\.com\/.+\/.+/.test(trimmedUrl)) {
		return 'plugin';
	}
	if (/^https?:\/\/.+\.(zip|tar\.gz|tgz)(\?.*)?$/.test(trimmedUrl)) {
		return 'plugin';
	}
	if (/^https?:\/\/.+/.test(trimmedUrl)) {
		return 'plugin';
	}

	return null;
}

/**
 * Detects WordPress admin URLs and extracts the admin path
 * @param url - The URL to analyze
 * @returns The admin path (e.g., '/wp-admin/index.php') or null if not an admin URL
 */
export function detectWpAdminUrl(url: string): string | null {
	if (!url || typeof url !== 'string') {
		return null;
	}

	const trimmed = url.trim();

	if (trimmed.startsWith('/wp-admin/') || trimmed.startsWith('/wp-login.php')) {
		return trimmed;
	}

	try {
		const urlObj = new URL(trimmed);
		const path = urlObj.pathname + urlObj.search + urlObj.hash;

		if (path.includes('/wp-admin/') || path.includes('/wp-login.php')) {
			return path;
		}
	} catch (e) {
		return null;
	}

	return null;
}

/**
 * Detects if text contains HTML code
 * @param text - The text to analyze
 * @returns true if text contains HTML with closing tags, false otherwise
 */
export function detectHtml(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}

	const trimmed = text.trim();

	return /<[^>]+>/.test(trimmed) && trimmed.includes('</');
}

/**
 * Detects if text contains PHP code
 * @param text - The text to analyze
 * @returns true if text contains PHP opening tags, false otherwise
 */
export function detectPhp(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}

	const trimmed = text.trim();

	return trimmed.startsWith('<?php') || (trimmed.includes('<?php') && trimmed.includes('?>'));
}

/**
 * Checks if a hostname is a WordPress Playground domain
 * @param hostname - The hostname to check
 * @returns true if hostname is playground.wordpress.net or 127.0.0.1, false otherwise
 */
export function isPlaygroundDomain( hostname: string ): boolean {
	return hostname === 'playground.wordpress.net' || hostname === '127.0.0.1';
}

/**
 * Checks if a URL is a Step Library URL (has blueprint in hash fragment)
 * @param urlObj - The URL object to check
 * @returns true if URL is a step-library URL with a hash, false otherwise
 */
function isStepLibraryUrl( urlObj: URL ): boolean {
	return urlObj.pathname.includes( '/playground-step-library' ) ||
		( urlObj.hostname === 'localhost' && urlObj.hash.length > 1 );
}

/**
 * Detects and parses WordPress Playground or Step Library URLs with blueprint in hash fragment
 * Supports both URL-encoded JSON and base64-encoded JSON
 * @param url - The URL to analyze
 * @param base64Decoder - Optional base64 decoder function (defaults to atob in browser)
 * @returns The parsed blueprint object or null if not a valid Playground/Step Library URL
 */
export function detectPlaygroundUrl( url: string, base64Decoder?: ( str: string ) => string ): any {
	if ( !url || typeof url !== 'string' ) {
		return null;
	}

	const trimmed = url.trim();

	try {
		const urlObj = new URL( trimmed );
		const hasValidHash = urlObj.hash && urlObj.hash.length > 1;
		const isValidDomain = isPlaygroundDomain( urlObj.hostname ) || isStepLibraryUrl( urlObj );

		if ( isValidDomain && hasValidHash ) {
			const hashContent = urlObj.hash.substring( 1 );

			// Try URL-encoded JSON first (starts with %7B which is '{')
			if ( hashContent.startsWith( '%7B' ) || hashContent.startsWith( '{' ) ) {
				try {
					const decoded = decodeURIComponent( hashContent );
					return JSON.parse( decoded );
				} catch ( e ) {
					// Not URL-encoded JSON
				}
			}

			// Try base64-encoded JSON
			try {
				const decode = base64Decoder || ( ( s: string ) => atob( s ) );
				const decoded = decode( hashContent );
				if ( decoded.startsWith( '{' ) ) {
					return JSON.parse( decoded );
				}
			} catch ( e ) {
				// Not valid base64
			}
		}
	} catch ( e ) {
		return null;
	}

	return null;
}

/**
 * Detects WordPress Playground URLs with query parameters
 * @param url - The URL to analyze
 * @returns true if URL is a Playground URL with query parameters, false otherwise
 */
export function detectPlaygroundQueryApiUrl(url: string): boolean {
	if (!url || typeof url !== 'string') {
		return false;
	}

	const trimmed = url.trim();

	try {
		const urlObj = new URL(trimmed);
		if (isPlaygroundDomain(urlObj.hostname) && urlObj.search) {
			return true;
		}
	} catch (e) {
		return false;
	}

	return false;
}

/**
 * Detects and parses wp-env.json configuration files
 * Validates that the JSON contains wp-env properties but NOT blueprint properties
 * @param text - The text to analyze
 * @returns The parsed wp-env config or null if not a valid wp-env.json
 */
export function detectWpEnvJson( text: string ): any {
	if ( !text || typeof text !== 'string' ) {
		return null;
	}

	const trimmed = text.trim();

	if ( !trimmed.startsWith( '{' ) || !trimmed.endsWith( '}' ) ) {
		return null;
	}

	try {
		const parsed = JSON.parse( trimmed );
		if ( parsed && typeof parsed === 'object' ) {
			const wpEnvProps = [ 'plugins', 'themes', 'config', 'mappings', 'core', 'phpVersion', 'port', 'env', 'lifecycleScripts' ];
			const hasAnyWpEnvProp = wpEnvProps.some( prop => prop in parsed );

			const blueprintProps = [ 'steps', 'landingPage', 'preferredVersions', 'features', 'siteOptions', 'login', 'phpExtensionBundles' ];
			const hasAnyBlueprintProp = blueprintProps.some( prop => prop in parsed );

			if ( hasAnyWpEnvProp && !hasAnyBlueprintProp ) {
				return parsed;
			}
		}
		return null;
	} catch ( e ) {
		return null;
	}
}

/**
 * Detects and parses WordPress Playground blueprint JSON strings
 * Validates that the JSON contains at least one blueprint property
 * (steps, landingPage, preferredVersions, features, siteOptions, login, plugins, constants, phpExtensionBundles)
 * @param text - The text to analyze
 * @returns The parsed blueprint object or null if not valid blueprint JSON
 */
export function detectBlueprintJson(text: string): any {
	if (!text || typeof text !== 'string') {
		return null;
	}

	const trimmed = text.trim();

	if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
		return null;
	}

	try {
		const parsed = JSON.parse(trimmed);
		if (parsed && typeof parsed === 'object') {
			const blueprintProps = ['steps', 'landingPage', 'preferredVersions', 'features', 'siteOptions', 'login', 'plugins', 'constants', 'phpExtensionBundles'];
			const hasAnyBlueprintProp = blueprintProps.some(prop => prop in parsed);

			if (hasAnyBlueprintProp) {
				return parsed;
			}
		}
		return null;
	} catch (e) {
		return null;
	}
}

/**
 * Detects if text contains CSS code
 * @param text - The text to analyze
 * @returns true if text appears to be CSS, false otherwise
 */
export function detectCss(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}

	const trimmed = text.trim();

	const cssPatterns = [
		/^[.#]?[\w-]+\s*\{/,
		/^\s*@(media|import|keyframes|font-face)/,
		/\{\s*[\w-]+\s*:\s*[^}]+\}/,
		/^\s*\/\*.*\*\//
	];

	return cssPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Detects if text contains JavaScript code
 * @param text - The text to analyze
 * @returns true if text appears to be JavaScript, false otherwise
 */
export function detectJs(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}

	const trimmed = text.trim();

	const jsPatterns = [
		/^(var|let|const)\s+\w+/,
		/^function\s+\w+/,
		/^(async\s+)?function\s*\(/,
		/=>\s*[{(]/,
		/^import\s+/,
		/^export\s+/,
		/console\.(log|error|warn)/,
		/document\.(querySelector|getElementById|addEventListener)/,
		/window\.\w+/,
		/^\s*\/\/.*/,
		/^\s*\/\*[\s\S]*\*\//
	];

	return jsPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Detects if text contains WP-CLI commands
 * @param text - The text to analyze
 * @returns Array of WP-CLI commands found, or null if none detected
 */
export function detectWpCli(text: string): string[] | null {
	if (!text || typeof text !== 'string') {
		return null;
	}

	const lines = text.split('\n').map(line => line.trim());
	const commands: string[] = [];

	for (const line of lines) {
		if (line.startsWith('wp ') || line.match(/^\$\s+wp\s+/)) {
			const command = line.replace(/^\$\s+/, '').replace(/^wp\s+/, '');
			if (command) {
				commands.push(command);
			}
		}
	}

	return commands.length > 0 ? commands : null;
}

/**
 * Detects and parses unwrapped step JSON (single step object)
 * Validates that the JSON contains a "step" property
 * @param text - The text to analyze
 * @returns The parsed step object or null if not valid step JSON
 */
export function detectStepJson(text: string): any {
	if (!text || typeof text !== 'string') {
		return null;
	}

	const trimmed = text.trim();

	if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
		return null;
	}

	try {
		const parsed = JSON.parse(trimmed);
		if (parsed && typeof parsed === 'object' && 'step' in parsed && typeof parsed.step === 'string') {
			return parsed;
		}
		return null;
	} catch (e) {
		return null;
	}
}

/**
 * Detects and parses Step Library redirect URLs with step[N] query parameters
 * @param url - The URL to analyze
 * @returns Parsed steps array or null if not a valid redirect URL
 */
export function detectStepLibraryRedirectUrl( url: string ): Array<{ step: string; vars: Record<string, string> }> | null {
	if ( !url || typeof url !== 'string' ) {
		return null;
	}

	const trimmed = url.trim();

	try {
		const urlObj = new URL( trimmed );
		const params = urlObj.searchParams;

		const paramMap: Record<string, Record<number, string>> = {};

		for ( const [key, value] of params.entries() ) {
			const arrayMatch = key.match( /^(\w+)\[(\d+)\]$/ );
			if ( arrayMatch ) {
				const paramName = arrayMatch[1];
				const index = parseInt( arrayMatch[2], 10 );

				if ( !paramMap[paramName] ) {
					paramMap[paramName] = {};
				}
				paramMap[paramName][index] = value;
			}
		}

		if ( !paramMap.step || Object.keys( paramMap.step ).length === 0 ) {
			return null;
		}

		const indices = Object.keys( paramMap.step ).sort( ( a, b ) => parseInt( a ) - parseInt( b ) );

		const steps = indices.map( index => {
			const idx = parseInt( index );
			const stepName = paramMap.step[idx];
			const vars: Record<string, string> = {};

			for ( const [paramName, values] of Object.entries( paramMap ) ) {
				if ( paramName !== 'step' && values[idx] !== undefined ) {
					let value = values[idx];
					// Normalize URLs without protocol
					if ( paramName === 'url' ) {
						if ( /^wordpress\.org\/(plugins|themes)\//.test( value ) ) {
							value = 'https://' + value;
						} else if ( /^github\.com\//.test( value ) ) {
							value = 'https://' + value;
						}
					}
					vars[paramName] = value;
				}
			}

			return { step: stepName, vars };
		} );

		return steps;
	} catch ( e ) {
		return null;
	}
}

/**
 * Normalizes WordPress plugin/theme download URLs to their canonical wordpress.org URLs
 * Converts downloads.wordpress.org URLs to wordpress.org/plugins or wordpress.org/themes URLs
 * @param url - The URL to normalize
 * @param urlType - The type of URL ('plugin' or 'theme')
 * @returns The normalized URL, or the original URL if no normalization is needed
 */
export function normalizeWordPressUrl(url: string, urlType: string | null): string {
	if (!url || !urlType) {
		return url;
	}

	if (urlType === 'plugin') {
		const pluginMatch = url.match(/^https?:\/\/downloads\.wordpress\.org\/plugin\/([^.]+)\..*\.zip$/);
		if (pluginMatch) {
			const slug = pluginMatch[1];
			return `https://wordpress.org/plugins/${slug}/`;
		}
	}

	if (urlType === 'theme') {
		const themeMatch = url.match(/^https?:\/\/downloads\.wordpress\.org\/theme\/([^.]+)\..*\.zip$/);
		if (themeMatch) {
			const slug = themeMatch[1];
			return `https://wordpress.org/themes/${slug}/`;
		}
	}

	return url;
}
