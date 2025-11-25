/**
 * Import wp-env configuration files (.wp-env.json) and convert to step library steps.
 *
 * wp-env is the official WordPress local development tool (Docker-based).
 * This allows developers to import their existing local dev configs into Playground.
 */

export interface WpEnvConfig {
	core?: string;
	phpVersion?: string;
	plugins?: ( string | { url: string } )[];
	themes?: ( string | { url: string } )[];
	config?: Record<string, any>;
	mappings?: Record<string, string>;
	port?: number;
	testsPort?: number;
	env?: {
		development?: Partial<WpEnvConfig>;
		tests?: Partial<WpEnvConfig>;
	};
	multisite?: boolean;
	lifecycleScripts?: {
		afterStart?: string;
		afterSetup?: string;
		afterClean?: string;
		afterDestroy?: string;
	};
}

/**
 * Step types that wpEnvToSteps can create.
 * Using explicit types ensures we use correct step names and var structures.
 */
interface InstallPluginStepData {
	step: 'installPlugin';
	vars: { url: string };
}

interface InstallThemeStepData {
	step: 'installTheme';
	vars: { url: string };
}

interface DefineWpConfigConstStepData {
	step: 'defineWpConfigConst';
	vars: { name: string; value: string };
}

interface RunWpCliCommandStepData {
	step: 'runWpCliCommand';
	vars: { command: string };
}

interface EnableMultisiteStepData {
	step: 'enableMultisite';
	vars: Record<string, never>;
}

type WpEnvStepData =
	| InstallPluginStepData
	| InstallThemeStepData
	| DefineWpConfigConstStepData
	| RunWpCliCommandStepData
	| EnableMultisiteStepData;

export interface WpEnvImportResult {
	steps: WpEnvStepData[];
	warnings: string[];
	unresolvedPlugins: string[];
	unresolvedThemes: string[];
	phpVersion?: string;
	wpVersion?: string;
}

/**
 * Detect if text is a wp-env.json configuration.
 * Returns the parsed config or null if not a valid wp-env.json.
 */
export function detectWpEnvJson( text: string ): WpEnvConfig | null {
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
			const wpEnvProps = [ 'plugins', 'themes', 'config', 'mappings', 'core', 'phpVersion', 'port', 'env', 'lifecycleScripts', 'multisite' ];
			const hasAnyWpEnvProp = wpEnvProps.some( prop => prop in parsed );

			// Make sure it's NOT a blueprint (which has steps, landingPage, etc.)
			const blueprintProps = [ 'steps', 'landingPage', 'preferredVersions', 'features', 'siteOptions', 'login', 'phpExtensionBundles' ];
			const hasAnyBlueprintProp = blueprintProps.some( prop => prop in parsed );

			if ( hasAnyWpEnvProp && !hasAnyBlueprintProp ) {
				return parsed as WpEnvConfig;
			}
		}
		return null;
	} catch ( e ) {
		return null;
	}
}

/**
 * Convert a wp-env.json configuration to step library steps.
 * Collects all plugins and themes from root and all environments, deduplicating.
 */
export function wpEnvToSteps( config: WpEnvConfig ): WpEnvImportResult {
	const steps: WpEnvStepData[] = [];
	const warnings: string[] = [];
	const unresolvedPlugins: string[] = [];
	const unresolvedThemes: string[] = [];

	// Collect all plugins from root and all environments
	const allPlugins = new Set<string>();

	const collectPlugins = ( plugins: ( string | { url: string } )[] | undefined ) => {
		if ( !plugins || !Array.isArray( plugins ) ) return;
		for ( const plugin of plugins ) {
			const url = normalizePluginSource( plugin );
			if ( url ) {
				allPlugins.add( url );
			} else if ( plugin === '.' || ( typeof plugin === 'string' && ( plugin.startsWith( './' ) || plugin.startsWith( '../' ) ) ) ) {
				if ( !unresolvedPlugins.includes( plugin as string ) ) {
					unresolvedPlugins.push( plugin as string );
				}
			}
		}
	};

	collectPlugins( config.plugins );
	if ( config.env?.development?.plugins ) collectPlugins( config.env.development.plugins );
	if ( config.env?.tests?.plugins ) collectPlugins( config.env.tests.plugins );

	for ( const url of allPlugins ) {
		steps.push( { step: 'installPlugin', vars: { url } } );
	}

	// Collect all themes from root and all environments
	const allThemes = new Set<string>();

	const collectThemes = ( themes: ( string | { url: string } )[] | undefined ) => {
		if ( !themes || !Array.isArray( themes ) ) return;
		for ( const theme of themes ) {
			const url = normalizeThemeSource( theme );
			if ( url ) {
				allThemes.add( url );
			} else if ( theme === '.' || ( typeof theme === 'string' && ( theme.startsWith( './' ) || theme.startsWith( '../' ) ) ) ) {
				if ( !unresolvedThemes.includes( theme as string ) ) {
					unresolvedThemes.push( theme as string );
				}
			}
		}
	};

	collectThemes( config.themes );
	if ( config.env?.development?.themes ) collectThemes( config.env.development.themes );
	if ( config.env?.tests?.themes ) collectThemes( config.env.tests.themes );

	for ( const url of allThemes ) {
		steps.push( { step: 'installTheme', vars: { url } } );
	}

	// Merge all config objects from root and environments
	const mergedConfig: Record<string, any> = {};
	if ( config.config ) {
		Object.assign( mergedConfig, config.config );
	}
	if ( config.env?.development?.config ) {
		Object.assign( mergedConfig, config.env.development.config );
	}
	if ( config.env?.tests?.config ) {
		Object.assign( mergedConfig, config.env.tests.config );
	}

	// Create a defineWpConfigConst step for each constant
	for ( const [ name, value ] of Object.entries( mergedConfig ) ) {
		steps.push( {
			step: 'defineWpConfigConst',
			vars: {
				name,
				value: String( value )
			}
		} );
	}

	// Handle multisite
	if ( config.multisite ) {
		steps.push( { step: 'enableMultisite', vars: {} } );
	}

	// Process lifecycle scripts from root only
	if ( config.lifecycleScripts ) {
		if ( config.lifecycleScripts.afterSetup ) {
			const script = config.lifecycleScripts.afterSetup;
			if ( script.startsWith( 'wp ' ) ) {
				steps.push( {
					step: 'runWpCliCommand',
					vars: { command: script }
				} );
			} else {
				warnings.push( `Lifecycle script "afterSetup" skipped (shell script)` );
			}
		}
		if ( config.lifecycleScripts.afterStart ) {
			warnings.push( `Lifecycle script "afterStart" skipped (shell script)` );
		}
		if ( config.lifecycleScripts.afterClean ) {
			warnings.push( `Lifecycle script "afterClean" skipped (shell script)` );
		}
	}

	// Count mappings from all sources
	let mappingCount = 0;
	if ( config.mappings ) mappingCount += Object.keys( config.mappings ).length;
	if ( config.env?.development?.mappings ) mappingCount += Object.keys( config.env.development.mappings ).length;
	if ( config.env?.tests?.mappings ) mappingCount += Object.keys( config.env.tests.mappings ).length;

	if ( mappingCount > 0 ) {
		warnings.push( `${mappingCount} file mapping(s) skipped` );
	}

	// Add warnings for unresolved local paths
	if ( unresolvedPlugins.length > 0 ) {
		warnings.push( `Local plugin path(s) skipped: ${unresolvedPlugins.join( ', ' )}` );
	}
	if ( unresolvedThemes.length > 0 ) {
		warnings.push( `Local theme path(s) skipped: ${unresolvedThemes.join( ', ' )}` );
	}

	return {
		steps,
		warnings,
		unresolvedPlugins,
		unresolvedThemes,
		phpVersion: config.phpVersion,
		wpVersion: extractWpVersion( config.core )
	};
}

/**
 * Extract WordPress version from wp-env core property.
 * Handles formats like:
 * - "WordPress/WordPress#6.4" (GitHub ref)
 * - "https://wordpress.org/wordpress-6.4.zip"
 * - "https://wordpress.org/wordpress-latest.zip" -> undefined (use default)
 * - null/undefined -> undefined (use default)
 */
function extractWpVersion( core: string | undefined ): string | undefined {
	if ( !core ) {
		return undefined;
	}

	// GitHub format: WordPress/WordPress#6.4 or WordPress/WordPress#6.4.2
	const githubMatch = core.match( /#(\d+\.\d+(?:\.\d+)?)$/ );
	if ( githubMatch ) {
		return githubMatch[1];
	}

	// URL format: wordpress-6.4.zip or wordpress-6.4.2.zip
	const urlMatch = core.match( /wordpress-(\d+\.\d+(?:\.\d+)?)\.zip/ );
	if ( urlMatch ) {
		return urlMatch[1];
	}

	// "latest" or unrecognized format
	return undefined;
}

/**
 * Normalize a plugin source from wp-env format to a URL.
 */
function normalizePluginSource( plugin: string | { url: string } ): string | null {
	if ( typeof plugin === 'object' && plugin.url ) {
		return plugin.url;
	}

	if ( typeof plugin !== 'string' ) {
		return null;
	}

	// Local paths can't be imported
	if ( plugin === '.' || plugin.startsWith( './' ) || plugin.startsWith( '../' ) ) {
		return null;
	}

	// WordPress.org slug (no slashes, no protocol)
	if ( !plugin.includes( '/' ) && !plugin.includes( ':' ) ) {
		return plugin;
	}

	// GitHub shorthand (org/repo)
	if ( plugin.match( /^[^\/]+\/[^\/]+$/ ) && !plugin.includes( ':' ) ) {
		return `https://github.com/${plugin}`;
	}

	// Full URL
	if ( plugin.startsWith( 'http://' ) || plugin.startsWith( 'https://' ) ) {
		return plugin;
	}

	return null;
}

/**
 * Normalize a theme source from wp-env format to a URL.
 */
function normalizeThemeSource( theme: string | { url: string } ): string | null {
	// Same logic as plugins
	return normalizePluginSource( theme );
}
