import { describe, it, expect } from 'vitest';
import { BlueprintDecompiler } from '../src/decompiler';
import PlaygroundStepLibrary from '../src/index';

describe('BlueprintDecompiler', () => {
	const decompiler = new BlueprintDecompiler();
	const compiler = new PlaygroundStepLibrary();

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
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/duplicate-page/',
					prs: false
				}
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
				step: 'installPlugin', vars: {
					url: 'https://github.com/WordPress/wordpress-playground/pull/2727',
					auth: true,
					prs: false,
					permalink: false
				}
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
				step: 'installPlugin', vars: {
					url: 'https://alex.kirk.at/wp-content/uploads/sites/2/2025/11/iconick-1.0.0.zip',
					prs: false,
					permalink: false
				}
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
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/view-transitions/',
					prs: false
				}
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
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/woocommerce/',
					prs: false
				}
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
				step: 'installTheme', vars: {
					url: 'https://wordpress.org/themes/hello-biz/',
					prs: false
				}
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
				step: 'installTheme', vars: {
					url: 'https://wordpress.org/themes/twentytwentyfour/',
					prs: false
				}
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
				step: 'setSiteName', vars: {
					sitename: 'My Amazing Site',
					tagline: 'Just another WordPress site'
				}
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
				step: 'setSiteName', vars: {
					sitename: 'My Site',
					tagline: ''
				}
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
				step: 'setLandingPage', vars: {
					landingPage: '/wp-admin/options-general.php?page=duplicate_page_settings'
				}
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
				step: 'muPlugin', vars: {
					name: 'my-plugin',
					code: expect.stringContaining('Plugin Name: Test Plugin')
				}
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
				vars: {
					filter: 'init',
					code: expect.stringContaining('get_loaded_extensions')
				}
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
				step: 'addFilter', vars: {
					filter: 'the_content',
					code: '__return_false'
				}
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
				vars: {
					blockNamespace: '',
					postTitle: 'Block Examples',
					limit: '0',
					postId: '1000',
					excludeCore: true
				}
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
				vars: {
					blockNamespace: 'core',
					postTitle: 'Core Blocks',
					limit: '10',
					postId: '2000',
					excludeCore: false
				}
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
				vars: { opml: expect.stringContaining('Alex Kirk') }
			});
			expect((result.steps[0] as any).vars.opml).toContain('https://alex.kirk.at');
			expect((result.steps[0] as any).vars.opml).toContain('https://adamadam.blog');
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
				step: 'runWpCliCommand', vars: {
					command: 'plugin list'
				}
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
				vars: { command: 'plugin install woocommerce --activate' }
			});
			expect(result.steps[1]).toMatchObject({
				step: 'runWpCliCommand',
				vars: { command: 'theme activate twentytwentyfour' }
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
				vars: {
					wpDebug: true,
					wpDebugDisplay: true,
					scriptDebug: false,
					queryMonitor: true
				}
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
				vars: {
					wpDebug: true,
					wpDebugDisplay: false,
					scriptDebug: true,
					queryMonitor: false
				}
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
				vars: { url: 'https://wordpress.org/plugins/elementor/' }
			});
			expect(result.steps[1]).toMatchObject({
				step: 'installTheme',
				vars: { url: 'https://wordpress.org/themes/hello-biz/' }
			});
			expect(result.steps[2]).toMatchObject({
				step: 'setLandingPage',
				vars: { landingPage: '/wp-admin/admin.php?page=elementor-app#/kit-library' }
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

	describe('top-level plugins array', () => {
		it('should decompile simple plugin slugs', () => {
			const nativeBlueprint = {
				plugins: ['hello-dolly', 'akismet']
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/hello-dolly/',
					prs: false
				}
			});
			expect(result.steps[1]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/akismet/',
					prs: false
				}
			});
		});

		it('should decompile plugin objects', () => {
			const nativeBlueprint = {
				plugins: [
					{
						resource: 'wordpress.org/plugins',
						slug: 'woocommerce'
					},
					{
						resource: 'url',
						url: 'https://example.com/my-plugin.zip'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/woocommerce/',
					prs: false
				}
			});
			expect(result.steps[1]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://example.com/my-plugin.zip',
					prs: false,
					permalink: false
				}
			});
		});

		it('should decompile mixed plugin formats', () => {
			const nativeBlueprint = {
				plugins: [
					'hello-dolly',
					{
						resource: 'wordpress.org/plugins',
						slug: 'jetpack'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/hello-dolly/',
					prs: false
				}
			});
			expect(result.steps[1]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/jetpack/',
					prs: false
				}
			});
		});

		it('should add plugins before steps', () => {
			const nativeBlueprint = {
				plugins: ['hello-dolly'],
				steps: [
					{
						step: 'runPHP',
						code: '<?php wp_insert_post(["post_title" => "Test Page", "post_content" => "Test content", "post_type" => "page"]);'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0].step).toBe('installPlugin');
			expect(result.steps[1].step).toBe('addPage');
		});
	});

	describe('top-level properties decompilation', () => {
		it('should decompile comprehensive blueprint with all top-level properties', () => {
			const nativeBlueprint = {
				plugins: ['akismet', 'hello-dolly'],
				login: true,
				siteOptions: {
					blogname: 'My Test Site',
					blogdescription: 'Just another test site',
					permalink_structure: '/%postname%/'
				},
				constants: {
					WP_DEBUG: true,
					WP_DEBUG_DISPLAY: true,
					SCRIPT_DEBUG: true
				},
				landingPage: '/wp-admin/',
				steps: [
					{
						step: 'runPHP',
						code: '<?php echo "test";'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps.length).toBeGreaterThanOrEqual(7);

			expect(result.steps.find(s => s.step === 'installPlugin' && (s as any).vars?.url?.includes('akismet'))).toBeDefined();
			expect(result.steps.find(s => s.step === 'installPlugin' && (s as any).vars?.url?.includes('hello-dolly'))).toBeDefined();
			expect(result.steps.find(s => s.step === 'login')).toBeDefined();
			expect(result.steps.find(s => s.step === 'setSiteName')).toBeDefined();
			expect(result.steps.find(s => s.step === 'setSiteOption' && (s as any).vars?.name === 'permalink_structure')).toBeDefined();
			expect(result.steps.find(s => s.step === 'debug')).toBeDefined();
			expect(result.steps.find(s => s.step === 'runPHP')).toBeDefined();
			expect(result.steps.find(s => s.step === 'setLandingPage')).toBeDefined();
		});

		it('should decompile login as object', () => {
			const nativeBlueprint = {
				login: {
					username: 'testuser',
					password: 'testpass'
				}
			};

			const result = decompiler.decompile(nativeBlueprint);

			const loginStep = result.steps.find(s => s.step === 'login');
			expect(loginStep).toBeDefined();
			expect((loginStep as any).vars?.username).toBe('testuser');
			expect((loginStep as any).vars?.password).toBe('testpass');
		});

		it('should decompile siteOptions individually', () => {
			const nativeBlueprint = {
				siteOptions: {
					option1: 'value1',
					option2: 'value2'
				}
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0].step).toBe('setSiteOption');
			expect((result.steps[0] as any).vars?.name).toBe('option1');
			expect((result.steps[0] as any).vars?.value).toBe('value1');
		});

		it('should decompile constants to debug step', () => {
			const nativeBlueprint = {
				constants: {
					WP_DEBUG: true,
					WP_DEBUG_DISPLAY: false
				}
			};

			const result = decompiler.decompile(nativeBlueprint);

			const debugStep = result.steps.find(s => s.step === 'debug');
			expect(debugStep).toBeDefined();
			expect((debugStep as any).vars?.wpDebug).toBe(true);
			expect((debugStep as any).vars?.wpDebugDisplay).toBe(false);
		});
	});

	describe('roundtrip: compile then decompile', () => {
		it('should roundtrip installPlugin', () => {
			const original = {
				steps: [
					{ step: 'installPlugin', vars: { url: 'https://wordpress.org/plugins/gutenberg/' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('installPlugin');
			expect((decompiled.steps[0] as any).vars?.url).toBe('https://wordpress.org/plugins/gutenberg/');
			expect(decompiled.confidence).toBe('high');
		});

		it('should roundtrip installTheme', () => {
			const original = {
				steps: [
					{ step: 'installTheme', vars: { url: 'https://wordpress.org/themes/flavor/' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('installTheme');
			expect((decompiled.steps[0] as any).vars?.url).toBe('https://wordpress.org/themes/flavor/');
		});

		it('should roundtrip setSiteName', () => {
			const original = {
				steps: [
					{ step: 'setSiteName', vars: { sitename: 'My Site', tagline: 'A great site' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('setSiteName');
			expect((decompiled.steps[0] as any).vars?.sitename).toBe('My Site');
			expect((decompiled.steps[0] as any).vars?.tagline).toBe('A great site');
		});

		it('should roundtrip debug step', () => {
			const original = {
				steps: [
					{ step: 'debug', vars: { wpDebug: true, wpDebugDisplay: true, scriptDebug: false, queryMonitor: false } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('debug');
			expect((decompiled.steps[0] as any).vars?.wpDebug).toBe(true);
			expect((decompiled.steps[0] as any).vars?.wpDebugDisplay).toBe(true);
			expect((decompiled.steps[0] as any).vars?.scriptDebug).toBe(false);
		});

		it('should roundtrip setLandingPage', () => {
			const original = {
				steps: [
					{ step: 'setLandingPage', vars: { landingPage: '/wp-admin/options.php' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('setLandingPage');
			expect((decompiled.steps[0] as any).vars?.landingPage).toBe('/wp-admin/options.php');
		});

		it('should roundtrip login', () => {
			const original = {
				steps: [
					{ step: 'login' }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('login');
		});

		it('should roundtrip addPage', () => {
			const original = {
				steps: [
					{ step: 'addPage', vars: { title: 'About Us', content: '<p>Welcome!</p>' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('addPage');
			expect((decompiled.steps[0] as any).vars?.title).toBe('About Us');
			expect((decompiled.steps[0] as any).vars?.content).toBe('<p>Welcome!</p>');
		});

		it('should roundtrip addPost', () => {
			const original = {
				steps: [
					{ step: 'addPost', vars: { title: 'Hello World', content: '<p>My first post</p>' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('addPost');
			expect((decompiled.steps[0] as any).vars?.title).toBe('Hello World');
		});

		it('should roundtrip muPlugin', () => {
			const original = {
				steps: [
					{ step: 'muPlugin', vars: { name: 'my-plugin', code: '<?php\nadd_action("init", function() { });' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('muPlugin');
			expect((decompiled.steps[0] as any).vars?.name).toBe('my-plugin');
			expect((decompiled.steps[0] as any).vars?.code).toContain('add_action');
		});

		it('should roundtrip addFilter', () => {
			const original = {
				steps: [
					{ step: 'addFilter', vars: { filter: 'the_content', code: '__return_false' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('addFilter');
			expect((decompiled.steps[0] as any).vars?.filter).toBe('the_content');
			expect((decompiled.steps[0] as any).vars?.code).toBe('__return_false');
		});

		it('should roundtrip runWpCliCommand', () => {
			const original = {
				steps: [
					{ step: 'runWpCliCommand', vars: { command: 'post list --format=json' } }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('runWpCliCommand');
			expect((decompiled.steps[0] as any).vars?.command).toBe('post list --format=json');
		});

		it('should roundtrip complex blueprint with multiple steps', () => {
			const original = {
				steps: [
					{ step: 'installPlugin', vars: { url: 'https://wordpress.org/plugins/woocommerce/' } },
					{ step: 'installTheme', vars: { url: 'https://wordpress.org/themes/flavor/' } },
					{ step: 'setSiteName', vars: { sitename: 'My Shop', tagline: 'Best products' } },
					{ step: 'setLandingPage', vars: { landingPage: '/wp-admin/' } },
					{ step: 'login' }
				]
			};

			const compiled = compiler.compile(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.confidence).toBe('high');
			expect(decompiled.unmappedSteps).toHaveLength(0);

			const stepTypes = decompiled.steps.map(s => s.step);
			expect(stepTypes).toContain('installPlugin');
			expect(stepTypes).toContain('installTheme');
			expect(stepTypes).toContain('setSiteName');
			expect(stepTypes).toContain('setLandingPage');
			expect(stepTypes).toContain('login');
		});
	});

	describe('V2 blueprint decompilation', () => {
		it('should detect V2 blueprints by version', () => {
			const v2Blueprint = {
				version: 2,
				plugins: ['gutenberg']
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0].step).toBe('installPlugin');
		});

		it('should decompile V2 plugins array with strings', () => {
			const v2Blueprint = {
				version: 2,
				plugins: ['gutenberg', 'woocommerce']
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/gutenberg/',
					prs: false
				}
			});
			expect(result.steps[1]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/woocommerce/',
					prs: false
				}
			});
		});

		it('should decompile V2 plugins array with objects', () => {
			const v2Blueprint = {
				version: 2,
				plugins: [
					{ resource: 'wordpress.org/plugins', slug: 'jetpack' },
					{ resource: 'url', url: 'https://example.com/plugin.zip' }
				]
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://wordpress.org/plugins/jetpack/',
					prs: false
				}
			});
			expect(result.steps[1]).toEqual({
				step: 'installPlugin', vars: {
					url: 'https://example.com/plugin.zip',
					prs: false,
					permalink: false
				}
			});
		});

		it('should decompile V2 themes array', () => {
			const v2Blueprint = {
				version: 2,
				themes: ['flavor', { resource: 'wordpress.org/themes', slug: 'flavor' }]
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toEqual({
				step: 'installTheme', vars: {
					url: 'https://wordpress.org/themes/flavor/',
					prs: false
				}
			});
		});

		it('should decompile V2 siteOptions', () => {
			const v2Blueprint = {
				version: 2,
				siteOptions: {
					blogname: 'My Site',
					blogdescription: 'A tagline',
					permalink_structure: '/%postname%/'
				}
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toEqual({
				step: 'setSiteName', vars: {
					sitename: 'My Site',
					tagline: 'A tagline'
				}
			});
			expect(result.steps[1]).toEqual({
				step: 'setSiteOption', vars: {
					name: 'permalink_structure',
					value: '/%postname%/'
				}
			});
		});

		it('should decompile V2 content array', () => {
			const v2Blueprint = {
				version: 2,
				content: [
					{
						type: 'posts',
						source: {
							post_title: 'About Us',
							post_content: '<p>Hello</p>',
							post_type: 'page',
							post_status: 'publish'
						}
					},
					{
						type: 'posts',
						source: {
							post_title: 'Hello World',
							post_content: '<p>Content</p>',
							post_type: 'post',
							post_status: 'publish'
						}
					}
				]
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toMatchObject({
				step: 'addPage',
				vars: { title: 'About Us', content: '<p>Hello</p>' }
			});
			expect(result.steps[1]).toMatchObject({
				step: 'addPost',
				vars: { title: 'Hello World', content: '<p>Content</p>' }
			});
		});

		it('should decompile V2 users array', () => {
			const v2Blueprint = {
				version: 2,
				users: [
					{ username: 'editor', email: 'editor@example.com', role: 'editor' },
					{ username: 'author', role: 'author' }
				]
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(2);
			expect(result.steps[0]).toMatchObject({
				step: 'createUser',
				vars: { username: 'editor', email: 'editor@example.com', role: 'editor' }
			});
			expect(result.steps[1]).toMatchObject({
				step: 'createUser',
				vars: { username: 'author', role: 'author' }
			});
		});

		it('should decompile V2 constants', () => {
			const v2Blueprint = {
				version: 2,
				constants: {
					WP_DEBUG: true,
					WP_DEBUG_DISPLAY: true,
					SCRIPT_DEBUG: false
				}
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'debug',
				vars: { wpDebug: true, wpDebugDisplay: true, scriptDebug: false }
			});
		});

		it('should decompile V2 applicationOptions with login', () => {
			const v2Blueprint = {
				version: 2,
				applicationOptions: {
					'wordpress-playground': {
						login: {}
					}
				}
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'login',
				vars: { username: 'admin', password: 'password' }
			});
		});

		it('should decompile V2 applicationOptions with landingPage', () => {
			const v2Blueprint = {
				version: 2,
				applicationOptions: {
					'wordpress-playground': {
						landingPage: '/wp-admin/'
					}
				}
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'setLandingPage', vars: {
					landingPage: '/wp-admin/'
				}
			});
		});

		it('should decompile V2 additionalStepsAfterExecution', () => {
			const v2Blueprint = {
				version: 2,
				additionalStepsAfterExecution: [
					{
						step: 'wp-cli',
						command: 'plugin list'
					}
				]
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'runWpCliCommand', vars: {
					command: 'plugin list'
				}
			});
		});

		it('should decompile complex V2 blueprint', () => {
			const v2Blueprint = {
				version: 2,
				plugins: ['gutenberg'],
				themes: ['flavor'],
				siteOptions: {
					blogname: 'My Site',
					blogdescription: 'A tagline'
				},
				users: [{ username: 'editor', role: 'editor' }],
				applicationOptions: {
					'wordpress-playground': {
						login: {},
						landingPage: '/wp-admin/'
					}
				}
			};

			const result = decompiler.decompile(v2Blueprint);

			expect(result.confidence).toBe('high');
			expect(result.unmappedSteps).toHaveLength(0);

			const stepTypes = result.steps.map(s => s.step);
			expect(stepTypes).toContain('installPlugin');
			expect(stepTypes).toContain('installTheme');
			expect(stepTypes).toContain('setSiteName');
			expect(stepTypes).toContain('createUser');
			expect(stepTypes).toContain('login');
			expect(stepTypes).toContain('setLandingPage');
		});
	});

	describe('transpile V1 to V2', () => {
		it('should transpile V1 installPlugin to V2', () => {
			const v1Native = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: { resource: 'wordpress.org/plugins', slug: 'gutenberg' },
						options: { activate: true }
					}
				]
			};

			const stepLibrary = decompiler.decompile(v1Native);
			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.version).toBe(2);
			expect(v2Native.plugins).toContain('gutenberg');
		});

		it('should transpile V1 setSiteOptions to V2 siteOptions with actual values', () => {
			const v1Native = {
				steps: [
					{
						step: 'setSiteOptions',
						options: { blogname: 'My Site', blogdescription: 'A tagline' }
					}
				]
			};

			const stepLibrary = decompiler.decompile(v1Native);
			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.version).toBe(2);
			expect(v2Native.siteOptions).toBeDefined();
			// Verify actual values are used, not placeholders like ${sitename}
			expect(v2Native.siteOptions!.blogname).toBe('My Site');
			expect(v2Native.siteOptions!.blogdescription).toBe('A tagline');
		});

		it('should transpile V1 installTheme to V2 themes array', () => {
			const v1Native = {
				steps: [
					{
						step: 'installTheme',
						themeData: { resource: 'wordpress.org/themes', slug: 'flavor' },
						options: { activate: true }
					}
				]
			};

			const stepLibrary = decompiler.decompile(v1Native);
			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.version).toBe(2);
			// Verify theme goes to themes array, not additionalStepsAfterExecution
			expect(v2Native.themes).toBeDefined();
			expect(v2Native.themes).toContain('flavor');
			expect(v2Native.additionalStepsAfterExecution).toBeUndefined();
		});

		it('should transpile V1 login to V2 applicationOptions', () => {
			const v1Native = {
				steps: [{ step: 'login' }]
			};

			const stepLibrary = decompiler.decompile(v1Native);
			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.version).toBe(2);
			expect(v2Native.applicationOptions?.['wordpress-playground']?.login).toBeDefined();
		});

		it('should transpile V1 landingPage to V2 applicationOptions', () => {
			const v1Native = {
				landingPage: '/wp-admin/',
				steps: []
			};

			const stepLibrary = decompiler.decompile(v1Native);
			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.version).toBe(2);
			expect(v2Native.applicationOptions?.['wordpress-playground']?.landingPage).toBe('/wp-admin/');
		});

		it('should transpile V1 runPHP with wp_insert_post to V2 content', () => {
			const v1Native = {
				steps: [
					{
						step: 'runPHP',
						code: `<?php require_once '/wordpress/wp-load.php';
$page_args = array(
'post_type'    => 'page',
'post_status'  => 'publish',
'post_title'   => 'About Us',
'post_content' => '<p>Welcome!</p>',
);
$page_id = wp_insert_post( $page_args );`,
						progress: { caption: 'addPage: About Us' }
					}
				]
			};

			const stepLibrary = decompiler.decompile(v1Native);
			expect(stepLibrary.steps[0].step).toBe('addPage');

			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.version).toBe(2);
			expect(v2Native.content).toHaveLength(1);
			expect(v2Native.content![0].source.post_title).toBe('About Us');
		});

		it('should transpile complex V1 blueprint to V2', () => {
			const v1Native = {
				landingPage: '/wp-admin/',
				steps: [
					{
						step: 'installPlugin',
						pluginData: { resource: 'wordpress.org/plugins', slug: 'woocommerce' },
						options: { activate: true }
					},
					{
						step: 'setSiteOptions',
						options: { blogname: 'My Store', blogdescription: 'Best products' }
					},
					{ step: 'login' }
				]
			};

			const stepLibrary = decompiler.decompile(v1Native);
			expect(stepLibrary.confidence).toBe('high');

			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.version).toBe(2);
			expect(v2Native.plugins).toContain('woocommerce');
			expect(v2Native.siteOptions).toBeDefined();
			expect(v2Native.applicationOptions?.['wordpress-playground']?.login).toBeDefined();
			expect(v2Native.applicationOptions?.['wordpress-playground']?.landingPage).toBe('/wp-admin/');
		});

		it('should preserve data through V1 → step library → V2 transpilation', () => {
			const v1Native = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: { resource: 'wordpress.org/plugins', slug: 'jetpack' },
						options: { activate: true }
					},
					{
						step: 'installPlugin',
						pluginData: { resource: 'wordpress.org/plugins', slug: 'akismet' },
						options: { activate: true }
					}
				]
			};

			const stepLibrary = decompiler.decompile(v1Native);
			const v2Native = compiler.compileV2({ steps: stepLibrary.steps });

			expect(v2Native.plugins).toContain('jetpack');
			expect(v2Native.plugins).toContain('akismet');
			expect(v2Native.plugins).toHaveLength(2);
		});
	});

	describe('V2 roundtrip: compile then decompile', () => {
		it('should roundtrip V2 installPlugin', () => {
			const original = {
				steps: [
					{ step: 'installPlugin', vars: { url: 'https://wordpress.org/plugins/gutenberg/' } }
				]
			};

			const compiled = compiler.compileV2(original);
			expect(compiled.version).toBe(2);

			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('installPlugin');
			expect((decompiled.steps[0] as any).vars?.url).toBe('https://wordpress.org/plugins/gutenberg/');
		});

		it('should roundtrip V2 installTheme', () => {
			const original = {
				steps: [
					{ step: 'installTheme', vars: { url: 'https://wordpress.org/themes/flavor/' } }
				]
			};

			const compiled = compiler.compileV2(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('installTheme');
			expect((decompiled.steps[0] as any).vars?.url).toBe('https://wordpress.org/themes/flavor/');
		});

		it('should roundtrip V2 addPage', () => {
			const original = {
				steps: [
					{ step: 'addPage', vars: { title: 'About Us', content: '<p>Welcome!</p>' } }
				]
			};

			const compiled = compiler.compileV2(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('addPage');
			expect((decompiled.steps[0] as any).vars?.title).toBe('About Us');
			expect((decompiled.steps[0] as any).vars?.content).toBe('<p>Welcome!</p>');
		});

		it('should roundtrip V2 createUser', () => {
			const original = {
				steps: [
					{ step: 'createUser', vars: { username: 'editor', password: 'password', role: 'editor' } }
				]
			};

			const compiled = compiler.compileV2(original);
			const decompiled = decompiler.decompile(compiled);

			// V2 users don't support passwords, so an additional runPHP step is added
			expect(decompiled.steps).toHaveLength(2);
			expect(decompiled.steps[0].step).toBe('createUser');
			expect((decompiled.steps[0] as any).vars?.username).toBe('editor');
			expect((decompiled.steps[0] as any).vars?.role).toBe('editor');
			expect(decompiled.steps[1].step).toBe('runPHP');
		});

		it('should roundtrip V2 login', () => {
			const original = {
				steps: [
					{ step: 'login' }
				]
			};

			const compiled = compiler.compileV2(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.steps).toHaveLength(1);
			expect(decompiled.steps[0].step).toBe('login');
		});

		it('should roundtrip V2 complex blueprint', () => {
			const original = {
				steps: [
					{ step: 'installPlugin', vars: { url: 'https://wordpress.org/plugins/woocommerce/' } },
					{ step: 'installTheme', vars: { url: 'https://wordpress.org/themes/flavor/' } },
					{ step: 'addPage', vars: { title: 'About', content: '<p>Hello</p>' } },
					{ step: 'createUser', vars: { username: 'shop_manager', password: 'password', role: 'shop_manager' } },
					{ step: 'login' }
				]
			};

			const compiled = compiler.compileV2(original);
			const decompiled = decompiler.decompile(compiled);

			expect(decompiled.confidence).toBe('high');

			const stepTypes = decompiled.steps.map(s => s.step);
			expect(stepTypes).toContain('installPlugin');
			expect(stepTypes).toContain('installTheme');
			expect(stepTypes).toContain('addPage');
			expect(stepTypes).toContain('createUser');
			expect(stepTypes).toContain('login');
		});
	});

	describe('Git resource handling', () => {
		it('should decompile git:directory with branch reference', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'git:directory',
							url: 'https://github.com/WordPress/gutenberg',
							ref: 'refs/heads/trunk'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				vars: {
					url: 'https://github.com/WordPress/gutenberg/tree/trunk',
					prs: false
				}
			});
		});

		it('should decompile git:directory with simple branch name', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'git:directory',
							url: 'https://github.com/WordPress/gutenberg',
							ref: 'feature-branch'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				vars: {
					url: 'https://github.com/WordPress/gutenberg/tree/feature-branch'
				}
			});
		});

		it('should decompile git:directory with commit SHA', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'git:directory',
							url: 'https://github.com/WordPress/gutenberg',
							ref: 'abc123def456789012345678901234567890abcd'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				vars: {
					url: 'https://github.com/WordPress/gutenberg/tree/abc123def456789012345678901234567890abcd'
				}
			});
		});

		it('should decompile git:directory with branch and directory path', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'git:directory',
							url: 'https://github.com/WordPress/wordpress-develop',
							ref: 'trunk',
							path: 'src/wp-content/plugins/akismet'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				vars: {
					url: 'https://github.com/WordPress/wordpress-develop/tree/trunk//src/wp-content/plugins/akismet'
				}
			});
		});

		it('should decompile git:directory for themes with branch', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installTheme',
						themeData: {
							resource: 'git:directory',
							url: 'https://github.com/WordPress/flavor',
							ref: 'main'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installTheme',
				vars: {
					url: 'https://github.com/WordPress/flavor/tree/main'
				}
			});
		});

		it('should decompile git:directory with HEAD ref as default', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'git:directory',
							url: 'https://github.com/akirk/blueprint-recorder'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				vars: {
					url: 'https://github.com/akirk/blueprint-recorder'
				}
			});
		});
	});

	describe('resource type handling', () => {
		it('should decompile literal resource for plugin', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'literal',
							name: 'my-plugin.zip',
							contents: 'base64encodedcontenthere'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				pluginData: { resource: 'literal', name: 'my-plugin.zip' }
			});
		});

		it('should decompile VFS resource for plugin', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'vfs',
							path: '/tmp/my-plugin.zip'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				pluginData: { resource: 'vfs', path: '/tmp/my-plugin.zip' }
			});
		});

		it('should decompile core-plugin resource', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'core-plugin',
							slug: 'hello-dolly'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installPlugin',
				pluginData: { resource: 'core-plugin', slug: 'hello-dolly' }
			});
		});

		it('should decompile literal resource for theme', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installTheme',
						themeData: {
							resource: 'literal',
							name: 'my-theme.zip',
							contents: 'base64encodedcontenthere'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installTheme',
				themeData: { resource: 'literal' }
			});
		});

		it('should decompile VFS resource for theme', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installTheme',
						themeData: {
							resource: 'vfs',
							path: '/tmp/my-theme.zip'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installTheme',
				themeData: { resource: 'vfs', path: '/tmp/my-theme.zip' }
			});
		});

		it('should decompile core-theme resource', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installTheme',
						themeData: {
							resource: 'core-theme',
							slug: 'flavor'
						}
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'installTheme',
				themeData: { resource: 'core-theme', slug: 'flavor' }
			});
		});

		it('should roundtrip literal plugin resource through v2 compilation', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginData: {
							resource: 'literal',
							name: 'my-plugin.zip',
							contents: 'base64content'
						}
					}
				]
			};

			const decompiled = decompiler.decompile(nativeBlueprint);
			expect(decompiled.steps[0]).toMatchObject({
				step: 'installPlugin',
				pluginData: { resource: 'literal', contents: 'base64content' }
			});

			// Compile to v2 - should preserve the step in additionalStepsAfterExecution
			const v2 = compiler.compileV2({ steps: decompiled.steps });
			expect(v2.additionalStepsAfterExecution).toHaveLength(1);
			expect(v2.additionalStepsAfterExecution![0]).toMatchObject({
				step: 'installPlugin',
				pluginData: { resource: 'literal', name: 'my-plugin.zip', contents: 'base64content' }
			});
		});

		it('should roundtrip VFS theme resource through v2 compilation', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'installTheme',
						themeData: {
							resource: 'vfs',
							path: '/tmp/theme.zip'
						}
					}
				]
			};

			const decompiled = decompiler.decompile(nativeBlueprint);
			const v2 = compiler.compileV2({ steps: decompiled.steps });

			expect(v2.additionalStepsAfterExecution).toHaveLength(1);
			expect(v2.additionalStepsAfterExecution![0]).toMatchObject({
				step: 'installTheme',
				themeData: { resource: 'vfs', path: '/tmp/theme.zip' }
			});
		});
	});

	describe('hidden steps decompilation', () => {
		it('should decompile activatePlugin step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'activatePlugin',
						pluginPath: 'hello-dolly/hello.php',
						pluginName: 'Hello Dolly'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'activatePlugin',
				pluginPath: 'hello-dolly/hello.php',
				pluginName: 'Hello Dolly'
			});
			expect(result.confidence).toBe('high');
		});

		it('should decompile activateTheme step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'activateTheme',
						themeFolderName: 'flavor'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'activateTheme',
				themeFolderName: 'flavor'
			});
		});

		it('should decompile activateTheme with v2 property name', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'activateTheme',
						themeDirectoryName: 'flavor'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'activateTheme',
				themeFolderName: 'flavor'
			});
		});

		it('should decompile cp step with path translation', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'cp',
						fromPath: '/wordpress/wp-content/themes/flavor/style.css',
						toPath: '/wordpress/wp-content/themes/flavor/style-backup.css'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'cp',
				fromPath: '/wp-content/themes/flavor/style.css',
				toPath: '/wp-content/themes/flavor/style-backup.css'
			});
		});

		it('should decompile mv step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'mv',
						fromPath: '/wordpress/wp-content/plugins/old-plugin',
						toPath: '/wordpress/wp-content/plugins/new-plugin'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'mv',
				fromPath: '/wp-content/plugins/old-plugin',
				toPath: '/wp-content/plugins/new-plugin'
			});
		});

		it('should decompile rm step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'rm',
						path: '/wordpress/wp-content/plugins/hello.php'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'rm',
				path: '/wp-content/plugins/hello.php'
			});
		});

		it('should decompile rmdir step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'rmdir',
						path: '/wordpress/wp-content/plugins/old-plugin'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'rmdir',
				path: '/wp-content/plugins/old-plugin'
			});
		});

		it('should decompile mkdir step for non-standard directories', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'mkdir',
						path: '/wordpress/wp-content/custom-folder'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toMatchObject({
				step: 'mkdir',
				path: '/wp-content/custom-folder'
			});
		});

		it('should skip mkdir for standard setup directories', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'mkdir',
						path: '/wordpress/wp-content/mu-plugins'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(0);
		});

		it('should decompile unzip step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'unzip',
						zipFile: { resource: 'url', url: 'https://example.com/plugin.zip' },
						extractToPath: '/wordpress/wp-content/plugins'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'unzip',
				extractToPath: '/wp-content/plugins'
			});
			expect((result.steps[0] as any).zipFile).toBeDefined();
		});

		it('should decompile unzip step with zipPath', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'unzip',
						zipPath: '/wordpress/tmp/plugin.zip',
						extractToPath: '/wordpress/wp-content/plugins'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'unzip',
				zipPath: '/tmp/plugin.zip',
				extractToPath: '/wp-content/plugins'
			});
		});

		it('should decompile runSql step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'runSql',
						sql: { resource: 'literal', contents: 'DELETE FROM wp_posts WHERE ID > 1;' }
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'runSql',
				sql: { resource: 'literal', contents: 'DELETE FROM wp_posts WHERE ID > 1;' }
			});
		});

		it('should decompile importWxr step', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'importWxr',
						file: { resource: 'url', url: 'https://example.com/export.xml' }
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps[0]).toMatchObject({
				step: 'importWxr',
				file: { resource: 'url', url: 'https://example.com/export.xml' }
			});
		});

		it('should decompile multiple hidden steps together', () => {
			const nativeBlueprint = {
				steps: [
					{
						step: 'mkdir',
						path: '/wordpress/wp-content/custom'
					},
					{
						step: 'cp',
						fromPath: '/wordpress/wp-content/themes/flavor/style.css',
						toPath: '/wordpress/wp-content/custom/style.css'
					},
					{
						step: 'activatePlugin',
						pluginPath: 'akismet/akismet.php'
					}
				]
			};

			const result = decompiler.decompile(nativeBlueprint);

			expect(result.steps).toHaveLength(3);
			expect(result.steps[0].step).toBe('mkdir');
			expect(result.steps[1].step).toBe('cp');
			expect(result.steps[2].step).toBe('activatePlugin');
			expect(result.confidence).toBe('high');
		});
	});
});
