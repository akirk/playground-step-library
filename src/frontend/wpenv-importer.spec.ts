import { describe, it, expect } from 'vitest';
import { detectWpEnvJson, wpEnvToSteps } from './wpenv-importer';

// Real-world wp-env.json example from WooCommerce
// Note: An inherent problem is that '.' (current directory) is used as a plugin,
// which we can't automatically resolve. This might be a case where prompting the
// user for the plugin URL would be helpful.
const realWorldWpEnv = {
	"core": "https://wordpress.org/wordpress-latest.zip",
	"phpVersion": "8.1",
	"plugins": [ "." ],
	"config": {
		"JETPACK_AUTOLOAD_DEV": true,
		"WP_DEBUG_LOG": true,
		"WP_DEBUG_DISPLAY": true,
		"ALTERNATE_WP_CRON": true
	},
	"lifecycleScripts": {
		"afterStart": "./tests/e2e-pw/bin/test-env-setup.sh",
		"afterClean": "./tests/e2e-pw/bin/test-env-setup.sh"
	},
	"env": {
		"development": {
			"mysqlPort": 58888
		},
		"tests": {
			"port": 8086,
			"mysqlPort": 58086,
			"plugins": [
				".",
				"https://downloads.wordpress.org/plugin/akismet.zip",
				"https://github.com/WP-API/Basic-Auth/archive/master.zip",
				"https://downloads.wordpress.org/plugin/wp-mail-logging.zip"
			],
			"themes": [],
			"config": {
				"WP_TESTS_DOMAIN": "localhost",
				"ALTERNATE_WP_CRON": false
			},
			"mappings": {
				"wp-cli.yml": "./tests/wp-cli.yml",
				"test-env-setup.sh": "./tests/e2e-pw/bin/test-env-setup.sh",
				"wp-content/plugins/filter-setter.php": "./tests/e2e-pw/bin/filter-setter.php",
				"wp-content/plugins/process-waiting-actions.php": "./tests/e2e-pw/bin/process-waiting-actions.php",
				"wp-content/plugins/test-helper-apis.php": "./tests/e2e-pw/bin/test-helper-apis.php",
				"test-data/images/": "./tests/e2e-pw/test-data/images/"
			}
		}
	}
};

describe( 'wpenv-importer', () => {
	describe( 'detectWpEnvJson', () => {
		it( 'should detect valid wp-env.json', () => {
			const config = JSON.stringify( {
				plugins: [ 'woocommerce' ],
				themes: [ 'twentytwentyfour' ]
			} );
			const result = detectWpEnvJson( config );
			expect( result ).not.toBeNull();
			expect( result.plugins ).toEqual( [ 'woocommerce' ] );
		} );

		it( 'should not detect blueprint JSON as wp-env', () => {
			const blueprint = JSON.stringify( {
				steps: [ { step: 'installPlugin' } ]
			} );
			const result = detectWpEnvJson( blueprint );
			expect( result ).toBeNull();
		} );

		it( 'should not detect random JSON as wp-env', () => {
			const random = JSON.stringify( { foo: 'bar' } );
			const result = detectWpEnvJson( random );
			expect( result ).toBeNull();
		} );

		it( 'should detect wp-env.json with lifecycleScripts and env', () => {
			const wpEnv = {
				plugins: [ '.' ],
				phpVersion: '8.2',
				config: {
					WP_DEBUG: true,
					WP_DEBUG_LOG: true,
					SCRIPT_DEBUG: true
				},
				lifecycleScripts: {
					afterStart: 'wp-env run cli wp plugin install query-monitor --activate'
				},
				env: {
					tests: {
						phpVersion: '8.4',
						core: 'WordPress/WordPress#6.8'
					}
				}
			};
			const result = detectWpEnvJson( JSON.stringify( wpEnv ) );
			expect( result ).not.toBeNull();
			expect( result.phpVersion ).toBe( '8.2' );
			expect( result.lifecycleScripts?.afterStart ).toBe( 'wp-env run cli wp plugin install query-monitor --activate' );
		} );

		it( 'should detect config with wp-env properties', () => {
			const config = JSON.stringify( {
				core: 'https://wordpress.org/wordpress-latest.zip',
				phpVersion: '8.1',
				config: { WP_DEBUG: true }
			} );
			const result = detectWpEnvJson( config );
			expect( result ).not.toBeNull();
			expect( result.phpVersion ).toBe( '8.1' );
		} );
	} );

	describe( 'wpEnvToSteps', () => {
		it( 'should convert plugins to installPlugin steps', () => {
			const config = {
				plugins: [
					'woocommerce',
					'https://downloads.wordpress.org/plugin/akismet.zip',
					'https://github.com/WordPress/gutenberg'
				]
			};
			const result = wpEnvToSteps( config );
			expect( result.steps ).toHaveLength( 3 );
			expect( result.steps[0] ).toEqual( {
				step: 'installPlugin',
				vars: { url: 'woocommerce' }
			} );
			expect( result.steps[1].vars.url ).toBe( 'https://downloads.wordpress.org/plugin/akismet.zip' );
			expect( result.steps[2].vars.url ).toBe( 'https://github.com/WordPress/gutenberg' );
		} );

		it( 'should convert themes to installTheme steps', () => {
			const config = {
				themes: [ 'twentytwentyfour' ]
			};
			const result = wpEnvToSteps( config );
			expect( result.steps ).toHaveLength( 1 );
			expect( result.steps[0] ).toEqual( {
				step: 'installTheme',
				vars: { url: 'twentytwentyfour' }
			} );
		} );

		it( 'should convert config to defineWpConfigConst steps', () => {
			const config = {
				config: {
					WP_DEBUG: true,
					WP_DEBUG_LOG: true
				}
			};
			const result = wpEnvToSteps( config );
			expect( result.steps ).toHaveLength( 2 );
			expect( result.steps[0].step ).toBe( 'defineWpConfigConst' );
			expect( result.steps[0].vars ).toEqual( { name: 'WP_DEBUG', value: 'true' } );
			expect( result.steps[1].vars ).toEqual( { name: 'WP_DEBUG_LOG', value: 'true' } );
		} );

		it( 'should skip local paths and warn', () => {
			const config = {
				plugins: [ '.', './local-plugin' ]
			};
			const result = wpEnvToSteps( config );
			expect( result.steps ).toHaveLength( 0 );
			expect( result.warnings ).toHaveLength( 1 );
			expect( result.warnings[0] ).toContain( '.' );
			expect( result.warnings[0] ).toContain( './local-plugin' );
		} );

		it( 'should collect plugins from all environments', () => {
			const config = {
				plugins: [ 'base-plugin' ],
				env: {
					tests: {
						plugins: [ 'test-plugin', 'https://example.com/test.zip' ]
					},
					development: {
						plugins: [ 'dev-plugin' ]
					}
				}
			};
			const result = wpEnvToSteps( config );
			expect( result.steps.filter( s => s.step === 'installPlugin' ) ).toHaveLength( 4 );
			const urls = result.steps.map( s => s.vars?.url );
			expect( urls ).toContain( 'base-plugin' );
			expect( urls ).toContain( 'test-plugin' );
			expect( urls ).toContain( 'dev-plugin' );
			expect( urls ).toContain( 'https://example.com/test.zip' );
		} );

		it( 'should deduplicate plugins across environments', () => {
			const config = {
				plugins: [ 'shared-plugin' ],
				env: {
					tests: {
						plugins: [ 'shared-plugin', 'test-only' ]
					}
				}
			};
			const result = wpEnvToSteps( config );
			const pluginSteps = result.steps.filter( s => s.step === 'installPlugin' );
			expect( pluginSteps ).toHaveLength( 2 );
		} );

		it( 'should merge config objects from all environments', () => {
			const config = {
				config: { WP_DEBUG: true },
				env: {
					tests: {
						config: { WP_DEBUG_LOG: true }
					},
					development: {
						config: { SCRIPT_DEBUG: true }
					}
				}
			};
			const result = wpEnvToSteps( config );
			const configSteps = result.steps.filter( s => s.step === 'defineWpConfigConst' );
			expect( configSteps ).toHaveLength( 3 );
			const names = configSteps.map( s => s.vars?.name );
			expect( names ).toContain( 'WP_DEBUG' );
			expect( names ).toContain( 'WP_DEBUG_LOG' );
			expect( names ).toContain( 'SCRIPT_DEBUG' );
		} );

		it( 'should convert GitHub shorthand to full URL', () => {
			const config = {
				plugins: [ 'WordPress/gutenberg' ]
			};
			const result = wpEnvToSteps( config );
			expect( result.steps[0].vars.url ).toBe( 'https://github.com/WordPress/gutenberg' );
		} );

		it( 'should return PHP version', () => {
			const config = {
				phpVersion: '8.1'
			};
			const result = wpEnvToSteps( config );
			expect( result.phpVersion ).toBe( '8.1' );
		} );

		it( 'should extract WordPress version from GitHub ref', () => {
			const config = {
				core: 'WordPress/WordPress#6.4'
			};
			const result = wpEnvToSteps( config );
			expect( result.wpVersion ).toBe( '6.4' );
		} );

		it( 'should extract WordPress version from URL', () => {
			const config = {
				core: 'https://wordpress.org/wordpress-6.4.2.zip'
			};
			const result = wpEnvToSteps( config );
			expect( result.wpVersion ).toBe( '6.4.2' );
		} );

		it( 'should return undefined for latest WordPress', () => {
			const config = {
				core: 'https://wordpress.org/wordpress-latest.zip'
			};
			const result = wpEnvToSteps( config );
			expect( result.wpVersion ).toBeUndefined();
		} );

		it( 'should warn about mappings', () => {
			const config = {
				mappings: {
					'wp-content/mu-plugins': './mu-plugins'
				}
			};
			const result = wpEnvToSteps( config );
			expect( result.warnings.some( w => w.includes( 'mapping' ) ) ).toBe( true );
		} );

		it( 'should convert multisite to enableMultisite step', () => {
			const config = {
				multisite: true
			};
			const result = wpEnvToSteps( config );
			expect( result.steps ).toHaveLength( 1 );
			expect( result.steps[0] ).toEqual( {
				step: 'enableMultisite',
				vars: {}
			} );
		} );

		it( 'should not create enableMultisite step when multisite is false', () => {
			const config = {
				multisite: false
			};
			const result = wpEnvToSteps( config );
			expect( result.steps.filter( s => s.step === 'enableMultisite' ) ).toHaveLength( 0 );
		} );

		it( 'should warn about afterClean lifecycle script', () => {
			const config = {
				lifecycleScripts: {
					afterClean: './cleanup.sh'
				}
			};
			const result = wpEnvToSteps( config );
			expect( result.warnings.some( w => w.includes( 'afterClean' ) ) ).toBe( true );
		} );
	} );

	describe( 'real-world wp-env.json', () => {
		it( 'should import WooCommerce wp-env.json correctly', () => {
			const result = wpEnvToSteps( realWorldWpEnv );

			// Should create 3 installPlugin steps (akismet, Basic-Auth, wp-mail-logging)
			const pluginSteps = result.steps.filter( s => s.step === 'installPlugin' );
			expect( pluginSteps ).toHaveLength( 3 );
			expect( pluginSteps.map( s => s.vars.url ) ).toContain( 'https://downloads.wordpress.org/plugin/akismet.zip' );
			expect( pluginSteps.map( s => s.vars.url ) ).toContain( 'https://github.com/WP-API/Basic-Auth/archive/master.zip' );
			expect( pluginSteps.map( s => s.vars.url ) ).toContain( 'https://downloads.wordpress.org/plugin/wp-mail-logging.zip' );

			// Should create 5 defineWpConfigConst steps (merged from root and tests env)
			const configSteps = result.steps.filter( s => s.step === 'defineWpConfigConst' );
			expect( configSteps ).toHaveLength( 5 );
			const configNames = configSteps.map( s => s.vars.name );
			expect( configNames ).toContain( 'JETPACK_AUTOLOAD_DEV' );
			expect( configNames ).toContain( 'WP_DEBUG_LOG' );
			expect( configNames ).toContain( 'WP_DEBUG_DISPLAY' );
			expect( configNames ).toContain( 'ALTERNATE_WP_CRON' );
			expect( configNames ).toContain( 'WP_TESTS_DOMAIN' );

			// ALTERNATE_WP_CRON should be 'false' (overwritten by tests env)
			const altCronStep = configSteps.find( s => s.vars.name === 'ALTERNATE_WP_CRON' );
			expect( altCronStep?.vars.value ).toBe( 'false' );

			// Should warn about skipped local plugin path
			expect( result.warnings.some( w => w.includes( '.' ) && w.includes( 'skipped' ) ) ).toBe( true );

			// Should warn about lifecycle scripts
			expect( result.warnings.some( w => w.includes( 'afterStart' ) ) ).toBe( true );

			// Should warn about mappings (6 total)
			expect( result.warnings.some( w => w.includes( '6' ) && w.includes( 'mapping' ) ) ).toBe( true );

			// Should return PHP version
			expect( result.phpVersion ).toBe( '8.1' );
		} );

		it( 'should detect real-world wp-env.json as valid', () => {
			const detected = detectWpEnvJson( JSON.stringify( realWorldWpEnv ) );
			expect( detected ).not.toBeNull();
			expect( detected.phpVersion ).toBe( '8.1' );
			expect( detected.plugins ).toEqual( [ '.' ] );
		} );
	} );
} );
