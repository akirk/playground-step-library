import { describe, it, expect } from 'vitest';
import { BlueprintDecompiler } from '../src/decompiler';

describe('BlueprintDecompiler', () => {
	const decompiler = new BlueprintDecompiler();

	describe('installPlugin decompilation', () => {
		it('should decompile wordpress.org plugin', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'duplicate-page'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin',
				url: 'https://wordpress.org/plugins/duplicate-page/',
				prs: false
			});
			expect(result.confidence).toBe('high');
			expect(result.unmappedSteps).toHaveLength(0);
		});

		it('should decompile GitHub PR plugin', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'git:directory',
							url: 'https://github.com/WordPress/wordpress-playground',
							ref: 'refs/pull/2727/head',
							refType: 'refname'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin',
				url: 'https://github.com/WordPress/wordpress-playground/pull/2727',
				auth: true,
				prs: false,
				permalink: false
			});
			expect(result.confidence).toBe('high');
		});

		it('should decompile direct URL plugin', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'url',
							url: 'https://alex.kirk.at/wp-content/uploads/sites/2/2025/11/iconick-1.0.0.zip'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin',
				url: 'https://alex.kirk.at/wp-content/uploads/sites/2/2025/11/iconick-1.0.0.zip',
				prs: false,
				permalink: false
			});
		});

		it('should convert downloads.wordpress.org plugin URL to wordpress.org', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'url',
							url: 'https://downloads.wordpress.org/plugin/view-transitions.latest-stable.zip'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin',
				url: 'https://wordpress.org/plugins/view-transitions/',
				prs: false
			});
			expect(result.confidence).toBe('high');
		});

		it('should convert downloads.wordpress.org plugin URL with version number', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'url',
							url: 'https://downloads.wordpress.org/plugin/woocommerce.8.5.2.zip'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toEqual({
				step: 'installPlugin',
				url: 'https://wordpress.org/plugins/woocommerce/',
				prs: false
			});
		});
	});

	describe('installTheme decompilation', () => {
		it('should decompile wordpress.org theme', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installTheme',
						themeData: {
							resource: 'wordpress.org/themes',
							slug: 'hello-biz'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installTheme',
				url: 'https://wordpress.org/themes/hello-biz/',
				prs: false
			});
			expect(result.confidence).toBe('high');
		});

		it('should convert downloads.wordpress.org theme URL to wordpress.org', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installTheme',
						themeData: {
							resource: 'url',
							url: 'https://downloads.wordpress.org/theme/twentytwentyfour.1.0.zip'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installTheme',
				url: 'https://wordpress.org/themes/twentytwentyfour/',
				prs: false
			});
		});
	});

	describe('setSiteName decompilation', () => {
		it('should decompile setSiteOptions with blogname and blogdescription', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'setSiteOptions',
						options: {
							blogname: 'My Amazing Site',
							blogdescription: 'Just another WordPress site'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'setSiteName',
				sitename: 'My Amazing Site',
				tagline: 'Just another WordPress site'
			});
			expect(result.confidence).toBe('high');
		});

		it('should decompile setSiteOptions with only blogname', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'setSiteOptions',
						options: {
							blogname: 'My Site'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toEqual({
				step: 'setSiteName',
				sitename: 'My Site',
				tagline: ''
			});
		});
	});

	describe('setLandingPage decompilation', () => {
		it('should decompile landingPage property', () => {
			const nativeBlueprint = {
				landingPage: '/wp-admin/options-general.php?page=duplicate_page_settings',
				steps: []
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'setLandingPage',
				landingPage: '/wp-admin/options-general.php?page=duplicate_page_settings'
			});
		});

		it('should combine plugin install with landingPage', () => {
			const nativeBlueprint = {
				landingPage: '/wp-admin/admin.php?page=googlesitekit-dashboard',
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'google-site-kit'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0].step).toBe('installPlugin');
			expect(result.steps[1].step).toBe('setLandingPage');
		});
	});

	describe('muPlugin decompilation', () => {
		it('should decompile writeFile to mu-plugins', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'mkdir',
						path: '/wordpress/wp-content/mu-plugins'
					},
					{
						step: 'writeFile',
						path: '/wordpress/wp-content/mu-plugins/my-plugin-1.php',
						data: '<?php\n/**\n * Plugin Name: Test Plugin\n */\nadd_action( \'init\', function() {\n\t// Do something\n} );'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'muPlugin',
				name: 'my-plugin',
				code: expect.stringContaining('Plugin Name: Test Plugin')
			});
		});
	});

	describe('addFilter decompilation', () => {
		it('should decompile mu-plugin with single add_filter to addFilter step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'mkdir',
						path: '/wordpress/wp-content/mu-plugins'
					},
					{
						step: 'writeFile',
						path: '/wordpress/wp-content/mu-plugins/addFilter-0.php',
						data: "<?php add_filter( 'init', function() { $e = get_loaded_extensions(); natsort( $e ); echo '<div style=\"float:left; margin-left: 1em\">AvailableExtensions:<ul><li>', implode('</li><li>', $e ), '</li></ul></div>'; phpinfo(); } );"
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'addFilter',
				filter: 'init',
				code: expect.stringContaining('get_loaded_extensions')
			});
		});

		it('should decompile add_filter with string callback', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'writeFile',
						path: '/wordpress/wp-content/mu-plugins/test.php',
						data: "<?php add_filter( 'the_content', '__return_false' );"
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toEqual({
				step: 'addFilter',
				filter: 'the_content',
				code: '__return_false'
			});
		});
	});

	describe('blockExamples decompilation', () => {
		it('should decompile blockExamples runPHP step', () => {
			const phpCode = `<?php
require_once '/wordpress/wp-load.php';
$block_namespace = '';
$limit = 0;
$post_id = 1000;
$exclude_core = true;
$registry = WP_Block_Type_Registry::get_instance();
// ... rest of code
wp_insert_post( array(
'import_id'    => $post_id,
'post_title'   => 'Block Examples',
'post_content' => $block_content,
'post_status'  => 'draft',
'post_type'    => 'post'
) );`;

			const nativeBlueprint = {
				steps: [
					{
						step: 'runPHP',
						code: phpCode,
						progress: {
							caption: 'blockExamples: Adding blocks to Block Examples'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'blockExamples',
				blockNamespace: '',
				postTitle: 'Block Examples',
				limit: '0',
				postId: '1000',
				excludeCore: true
			});
		});

		it('should handle blockExamples with different parameters', () => {
			const phpCode = `<?php
require_once '/wordpress/wp-load.php';
$block_namespace = 'core';
$limit = 10;
$post_id = 2000;
$exclude_core = false;
wp_insert_post( array(
'import_id'    => $post_id,
'post_title'   => 'Core Blocks',
'post_content' => $block_content,
'post_status'  => 'draft',
'post_type'    => 'post'
) );`;

			const nativeBlueprint = {
				steps: [
					{
						step: 'runPHP',
						code: phpCode,
						progress: {
							caption: 'blockExamples: Adding blocks'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'blockExamples',
				blockNamespace: 'core',
				postTitle: 'Core Blocks',
				limit: '10',
				postId: '2000',
				excludeCore: false
			});
		});
	});

	describe('importFriendFeeds decompilation', () => {
		it('should decompile Friends plugin feeds import', () => {
			const phpCode = `<?php require_once '/wordpress/wp-load.php';if(class_exists('Friends\\\\Import')){$feeds=array(array('https://alex.kirk.at','Alex Kirk'),array('https://adamadam.blog','Adam Zieliński'));$x=new SimpleXMLElement('<opml/>');Friends\\\\Import::opml($x->asXML());}`;

			const nativeBlueprint = {
				steps: [
					{
						step: 'runPHP',
						code: phpCode,
						progress: {
							caption: 'Importing feeds to Friends plugin'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'importFriendFeeds',
				opml: expect.stringContaining('Alex Kirk')
			});
			expect(result.steps[0].opml).toContain('https://alex.kirk.at');
			expect(result.steps[0].opml).toContain('https://adamadam.blog');
		});
	});

	describe('runWpCliCommand decompilation', () => {
		it('should decompile wp-cli step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'wp-cli',
						command: 'plugin list'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'runWpCliCommand',
				command: 'plugin list'
			});
			expect(result.confidence).toBe('high');
		});

		it('should handle multiple wp-cli commands', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'wp-cli',
						command: 'plugin install woocommerce --activate'
					},
					{
						step: 'wp-cli',
						command: 'theme activate twentytwentyfour'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toMatchObject({
				step: 'runWpCliCommand',
				command: 'plugin install woocommerce --activate'
			});
			expect(result.steps[1]).toMatchObject({
				step: 'runWpCliCommand',
				command: 'theme activate twentytwentyfour'
			});
		});
	});

	describe('debug step decompilation', () => {
		it('should decompile defineWpConfigConsts with Query Monitor', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'defineWpConfigConsts',
						consts: {
							WP_DEBUG: true,
							WP_DEBUG_DISPLAY: true
						}
					},
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'query-monitor'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toMatchObject({
				step: 'debug',
				wpDebug: true,
				wpDebugDisplay: true,
				scriptDebug: false,
				queryMonitor: true
			});
		});

		it('should decompile defineWpConfigConsts without Query Monitor', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'defineWpConfigConsts',
						consts: {
							WP_DEBUG: true,
							WP_DEBUG_DISPLAY: false,
							SCRIPT_DEBUG: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'debug',
				wpDebug: true,
				wpDebugDisplay: false,
				scriptDebug: true,
				queryMonitor: false
			});
		});
	});

	describe('complex blueprints', () => {
		it('should decompile complete Elementor blueprint', () => {
			const nativeBlueprint = {
				landingPage: '/wp-admin/admin.php?page=elementor-app#/kit-library',
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'elementor'
						},
						options: {
							activate: true
						}
					},
					{
						step: 'installTheme',
						themeData: {
							resource: 'wordpress.org/themes',
							slug: 'hello-biz'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(3);
			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				url: 'https://wordpress.org/plugins/elementor/'
			});
			expect(result.steps[1]).toMatchObject({
				step: 'installTheme',
				url: 'https://wordpress.org/themes/hello-biz/'
			});
			expect(result.steps[2]).toMatchObject({
				step: 'setLandingPage',
				landingPage: '/wp-admin/admin.php?page=elementor-app#/kit-library'
			});
			expect(result.confidence).toBe('high');
			expect(result.unmappedSteps).toHaveLength(0);
		});

		it('should decompile Friends plugin blueprint', () => {
			const nativeBlueprint = {
				landingPage: '/friends/?refresh&welcome',
				steps: [
					{
						step: 'setSiteOptions',
						options: {
							permalink_structure: '/%postname%/'
						}
					},
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'friends'
						},
						options: {
							activate: true
						}
					},
					{
						step: 'runPHP',
						code: `<?php require_once '/wordpress/wp-load.php';if(class_exists('Friends\\\\Import')){$feeds=array(array('https://alex.kirk.at','Alex Kirk'));Friends\\\\Import::opml($x->asXML());}`,
						progress: {
							caption: 'Importing feeds to Friends plugin'
						}
					},
					{
						step: 'defineWpConfigConsts',
						consts: {
							WP_DEBUG: true,
							WP_DEBUG_DISPLAY: true
						}
					},
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'query-monitor'
						},
						options: {
							activate: true
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps.length).toBeGreaterThanOrEqual(3);
			const stepTypes = result.steps.map(s => s.step);
			expect(stepTypes).toContain('installPlugin');
			expect(stepTypes).toContain('importFriendFeeds');
			expect(stepTypes).toContain('debug');
			expect(stepTypes).toContain('setLandingPage');
		});
	});

	describe('confidence calculation', () => {
		it('should return high confidence for fully mapped blueprint', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'test-plugin'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.confidence).toBe('high');
			expect(result.unmappedSteps).toHaveLength(0);
		});

		it('should return low confidence for mostly unmapped blueprint', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'unknownStep1',
						data: 'test'
					},
					{
						step: 'unknownStep2',
						data: 'test'
					},
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'wordpress.org/plugins',
							slug: 'test-plugin'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.confidence).toBe('low');
			expect(result.unmappedSteps.length).toBeGreaterThan(0);
		});
	});

	describe('warnings', () => {
		it('should generate warnings for unknown step types', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'unknownStepType',
						data: 'test'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.warnings.length).toBeGreaterThan(0);
			expect(result.warnings[0]).toContain('Unknown native step type');
		});

		it('should warn about setSiteOptions', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'setSiteOptions',
						options: {
							permalink_structure: '/%postname%/'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.warnings.length).toBeGreaterThan(0);
			expect(result.warnings[0]).toContain('setSiteOptions');
		});
	});
});
