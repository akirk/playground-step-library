import type { StepFunction, WpappStep, StepResult, CompilationContext } from './types.js';
import { v1ToV2Fallback } from './types.js';
import { installPlugin } from './installPlugin.js';
import { parseGitUrl } from './gitProviders.js';

// Lightweight Composer replacement used by the wp-app PR preview blueprints.
const autoload = String.raw`<?php
require_once __DIR__ . '/akirk/wp-app/functions.php';
// App classes may rely on Composer instead of registering their own autoloader.
$composer = json_decode( file_get_contents( dirname( __DIR__ ) . '/composer.json' ), true );
$prefixes = $composer['autoload']['psr-4'] ?? [];
spl_autoload_register( static function ( $class ) use ( $prefixes ) {
	foreach ( $prefixes as $prefix => $directories ) {
		if ( strncmp( $class, $prefix, strlen( $prefix ) ) !== 0 ) {
			continue;
		}
		foreach ( (array) $directories as $directory ) {
			$file = dirname( __DIR__ ) . '/' . rtrim( $directory, '/' ) . '/' . str_replace( '\\', '/', substr( $class, strlen( $prefix ) ) ) . '.php';
			if ( is_file( $file ) ) {
				require_once $file;
				return;
			}
		}
	}
} );
spl_autoload_register( static function ( $class ) {
	$map = [
		'WpApp\\BaseApp' => 'abstract-baseapp.php',
		'WpApp\\BaseStorage' => 'BaseStorage.php',
		'WpApp\\Themes' => 'class-themes.php',
		'WpApp\\ClientEncryptedFields' => 'class-client-encrypted-fields.php',
		'WpApp\\Masterbar' => 'class-masterbar.php',
		'WpApp\\Openstation' => 'class-openstation.php',
		'WpApp\\Pwa' => 'class-pwa.php',
		'WpApp\\Registry' => 'class-registry.php',
		'WpApp\\Router' => 'class-router.php',
		'WpApp\\Settings' => 'class-settings.php',
		'WpApp\\WpApp' => 'class-wpapp.php',
		'WpApp\\Rest\\Access' => 'rest/class-access.php',
		'WpApp\\Rest\\Private_Posts_Controller' => 'rest/class-private-posts-controller.php',
		'WpApp\\Rest\\Private_Terms_Controller' => 'rest/class-private-terms-controller.php',
	];
	if ( isset( $map[ $class ] ) ) {
		require_once __DIR__ . '/akirk/wp-app/' . $map[ $class ];
	}
} );
`;

export const wpapp: StepFunction<WpappStep> = ( step: WpappStep, context?: CompilationContext ): StepResult => ( {
	toV1() {
		const parsed = parseGitUrl( step.vars?.url || '' );
		if ( ! parsed || parsed.provider.name !== 'GitHub' ) {
			return { steps: [] };
		}
		const slug = step.vars?.pluginSlug || parsed.directory.split( '/' ).pop() || parsed.repo.replace( /\.git$/, '' );
		if ( ! /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test( slug ) || slug === '..' ) {
			return { steps: [] };
		}
		const pluginFile = step.vars?.pluginFile || `${slug}.php`;
		if ( ! /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.php$/.test( pluginFile ) ) {
			return { steps: [] };
		}
		const app = installPlugin( { step: 'installPlugin', vars: { ...step.vars, url: step.vars?.url || '', pluginSlug: slug } }, context ).toV1();
		const install = app.steps?.[0];
		if ( ! install || typeof install !== 'object' || install.step !== 'installPlugin' ) {
			return { steps: [] };
		}
		const dependency = installPlugin( {
			step: 'installPlugin',
			vars: { url: 'https://github.com/akirk/wp-app/tree/main//src', pluginSlug: `${slug}/vendor/akirk/wp-app` },
		} ).toV1().steps?.[0];
		if ( ! dependency || typeof dependency !== 'object' || dependency.step !== 'installPlugin' ) {
			return { steps: [] };
		}
		return {
			steps: [
				{ ...install, options: { ...install.options, activate: false } },
				{ ...dependency, options: { ...dependency.options, activate: false } },
				{ step: 'mkdir', path: `/wordpress/wp-content/plugins/${slug}/vendor` },
				{ step: 'writeFile', path: `/wordpress/wp-content/plugins/${slug}/vendor/autoload.php`, data: autoload },
				{ step: 'activatePlugin', pluginPath: `${slug}/${pluginFile}` },
			],
		};
	},
	toV2() {
		return v1ToV2Fallback( this.toV1() );
	},
} );

wpapp.description = 'Install a GitHub app with the akirk/wp-app package and preview autoloader.';
wpapp.vars = [
	{ name: 'url', description: 'GitHub URL of the app (repository, branch, or pull request).', required: true, samples: [ '' ] },
	{ name: 'pluginSlug', description: 'Plugin folder name (defaults to the repository or directory name).', samples: [ '' ] },
	{ name: 'pluginFile', description: 'Plugin entry PHP filename (defaults to the plugin slug plus .php).', samples: [ '' ] },
	{ name: 'prs', description: 'Add support for submitting GitHub Pull Requests.', type: 'boolean', samples: [ 'false', 'true' ] },
];
