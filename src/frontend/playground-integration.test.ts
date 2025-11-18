import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parsePlaygroundQueryApi, shouldUseMuPlugin } from './playground-integration';

describe('playground-integration', () => {
	let consoleErrorSpy: any;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	describe('parsePlaygroundQueryApi', () => {
		it('should return null for invalid input', () => {
			expect(parsePlaygroundQueryApi('')).toBe(null);
			expect(parsePlaygroundQueryApi(null as any)).toBe(null);
			expect(parsePlaygroundQueryApi(undefined as any)).toBe(null);
		});

		it('should return null for non-playground domains', () => {
			const url = 'https://example.com/?plugin=test';
			expect(parsePlaygroundQueryApi(url)).toBe(null);
		});

		it('should return empty blueprint for playground URL without params', () => {
			const url = 'https://playground.wordpress.net/';
			const result = parsePlaygroundQueryApi(url);
			expect(result).toEqual({});
		});

		it('should parse single plugin', () => {
			const url = 'https://playground.wordpress.net/?plugin=hello-dolly';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin',
				pluginData: { resource: 'wordpress.org/plugins', slug: 'hello-dolly' }
			});
		});

		it('should parse multiple plugins', () => {
			const url = 'https://playground.wordpress.net/?plugin=hello-dolly&plugin=akismet';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(2);
			expect(result.steps[0].pluginData.slug).toBe('hello-dolly');
			expect(result.steps[1].pluginData.slug).toBe('akismet');
		});

		it('should parse single theme', () => {
			const url = 'https://playground.wordpress.net/?theme=twentytwentythree';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installTheme',
				themeData: { resource: 'wordpress.org/themes', slug: 'twentytwentythree' }
			});
		});

		it('should parse multiple themes', () => {
			const url = 'https://playground.wordpress.net/?theme=twentytwentythree&theme=astra';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(2);
			expect(result.steps[0].themeData.slug).toBe('twentytwentythree');
			expect(result.steps[1].themeData.slug).toBe('astra');
		});

		it('should parse PHP version', () => {
			const url = 'https://playground.wordpress.net/?php=8.0';
			const result = parsePlaygroundQueryApi(url);
			expect(result.phpExtensionBundles).toEqual(['8.0']);
		});

		it('should parse WordPress version', () => {
			const url = 'https://playground.wordpress.net/?wp=6.4';
			const result = parsePlaygroundQueryApi(url);
			expect(result.preferredVersions).toEqual({ wp: '6.4' });
		});

		it('should parse multisite=yes', () => {
			const url = 'https://playground.wordpress.net/?multisite=yes';
			const result = parsePlaygroundQueryApi(url);
			expect(result.features).toEqual({ networking: true });
		});

		it('should parse multisite=true', () => {
			const url = 'https://playground.wordpress.net/?multisite=true';
			const result = parsePlaygroundQueryApi(url);
			expect(result.features).toEqual({ networking: true });
		});

		it('should parse multisite=1', () => {
			const url = 'https://playground.wordpress.net/?multisite=1';
			const result = parsePlaygroundQueryApi(url);
			expect(result.features).toEqual({ networking: true });
		});

		it('should not set multisite for other values', () => {
			const url = 'https://playground.wordpress.net/?multisite=no';
			const result = parsePlaygroundQueryApi(url);
			expect(result.features).toBeUndefined();
		});

		it('should parse login=yes', () => {
			const url = 'https://playground.wordpress.net/?login=yes';
			const result = parsePlaygroundQueryApi(url);
			expect(result.login).toBe(true);
		});

		it('should parse login=true', () => {
			const url = 'https://playground.wordpress.net/?login=true';
			const result = parsePlaygroundQueryApi(url);
			expect(result.login).toBe(true);
		});

		it('should parse login=1', () => {
			const url = 'https://playground.wordpress.net/?login=1';
			const result = parsePlaygroundQueryApi(url);
			expect(result.login).toBe(true);
		});

		it('should not set login for other values', () => {
			const url = 'https://playground.wordpress.net/?login=no';
			const result = parsePlaygroundQueryApi(url);
			expect(result.login).toBeUndefined();
		});

		it('should parse Gutenberg PR', () => {
			const url = 'https://playground.wordpress.net/?gutenberg-pr=12345';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'installPlugin',
				pluginData: {
					resource: 'url',
					url: 'https://plugin-proxy.wordpress.net/gutenberg/gutenberg-build-pr-12345.zip'
				}
			});
		});

		it('should parse Core PR', () => {
			const url = 'https://playground.wordpress.net/?core-pr=54321';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0]).toEqual({
				step: 'runPHP',
				code: '<?php require \'/wordpress/wp-load.php\'; wp_install_core_pr(54321);'
			});
		});

		it('should parse landing page URL', () => {
			const url = 'https://playground.wordpress.net/?url=/wp-admin/';
			const result = parsePlaygroundQueryApi(url);
			expect(result.landingPage).toBe('/wp-admin/');
		});

		it('should parse seamless mode', () => {
			const url = 'https://playground.wordpress.net/?mode=seamless';
			const result = parsePlaygroundQueryApi(url);
			expect(result.preferredVersions).toEqual({ seamless: true });
		});

		it('should parse seamless mode with WordPress version', () => {
			const url = 'https://playground.wordpress.net/?wp=6.4&mode=seamless';
			const result = parsePlaygroundQueryApi(url);
			expect(result.preferredVersions).toEqual({ wp: '6.4', seamless: true });
		});

		it('should parse language', () => {
			const url = 'https://playground.wordpress.net/?language=de_DE';
			const result = parsePlaygroundQueryApi(url);
			expect(result.siteOptions).toEqual({ WPLANG: 'de_DE' });
		});

		it('should parse complex URL with multiple params', () => {
			const url = 'https://playground.wordpress.net/?php=8.0&wp=6.4&plugin=hello-dolly&plugin=akismet&theme=twentytwentythree&multisite=yes&login=yes&url=/wp-admin/&language=en_US';
			const result = parsePlaygroundQueryApi(url);

			expect(result.phpExtensionBundles).toEqual(['8.0']);
			expect(result.preferredVersions.wp).toBe('6.4');
			expect(result.features).toEqual({ networking: true });
			expect(result.login).toBe(true);
			expect(result.landingPage).toBe('/wp-admin/');
			expect(result.siteOptions).toEqual({ WPLANG: 'en_US' });
			expect(result.steps).toHaveLength(3);
			expect(result.steps[0].step).toBe('installPlugin');
			expect(result.steps[1].step).toBe('installPlugin');
			expect(result.steps[2].step).toBe('installTheme');
		});

		it('should work with 127.0.0.1 domain', () => {
			const url = 'http://127.0.0.1/?plugin=test';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0].pluginData.slug).toBe('test');
		});

		it('should handle URL with whitespace', () => {
			const url = '  https://playground.wordpress.net/?plugin=test  ';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(1);
		});

		it('should return null for invalid URL format', () => {
			const url = 'not-a-valid-url';
			const result = parsePlaygroundQueryApi(url);
			expect(result).toBe(null);
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it('should preserve order of steps', () => {
			const url = 'https://playground.wordpress.net/?plugin=plugin1&theme=theme1&plugin=plugin2&gutenberg-pr=123';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(4);
			expect(result.steps[0].pluginData?.slug).toBe('plugin1');
			expect(result.steps[1].pluginData?.slug).toBe('plugin2');
			expect(result.steps[2].themeData?.slug).toBe('theme1');
			expect(result.steps[3].pluginData?.url).toContain('gutenberg-build-pr-123');
		});

		it('should handle mode parameter that is not seamless', () => {
			const url = 'https://playground.wordpress.net/?mode=fullscreen';
			const result = parsePlaygroundQueryApi(url);
			expect(result.preferredVersions).toBeUndefined();
		});

		it('should not include steps array if no steps', () => {
			const url = 'https://playground.wordpress.net/?php=8.0';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toBeUndefined();
		});

		it('should handle encoded URL parameters', () => {
			const url = 'https://playground.wordpress.net/?url=%2Fwp-admin%2F';
			const result = parsePlaygroundQueryApi(url);
			expect(result.landingPage).toBe('/wp-admin/');
		});

		it('should handle multiple Gutenberg PRs', () => {
			const url = 'https://playground.wordpress.net/?gutenberg-pr=123&gutenberg-pr=456';
			const result = parsePlaygroundQueryApi(url);
			// Only the first one should be processed (getAll not used for gutenberg-pr)
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0].pluginData.url).toContain('gutenberg-build-pr-123');
		});

		it('should handle empty parameter values', () => {
			const url = 'https://playground.wordpress.net/?plugin=';
			const result = parsePlaygroundQueryApi(url);
			expect(result.steps).toHaveLength(1);
			expect(result.steps[0].pluginData.slug).toBe('');
		});
	});

	describe('shouldUseMuPlugin', () => {
		it('should return true for add_action', () => {
			expect(shouldUseMuPlugin('add_action(\'init\', \'my_function\');')).toBe(true);
		});

		it('should return true for add_filter', () => {
			expect(shouldUseMuPlugin('add_filter(\'the_content\', \'my_filter\');')).toBe(true);
		});

		it('should return true for remove_action', () => {
			expect(shouldUseMuPlugin('remove_action(\'wp_head\', \'wp_generator\');')).toBe(true);
		});

		it('should return true for remove_filter', () => {
			expect(shouldUseMuPlugin('remove_filter(\'the_content\', \'wpautop\');')).toBe(true);
		});

		it('should return true for register_post_type', () => {
			expect(shouldUseMuPlugin('register_post_type(\'book\', $args);')).toBe(true);
		});

		it('should return true for register_taxonomy', () => {
			expect(shouldUseMuPlugin('register_taxonomy(\'genre\', \'book\', $args);')).toBe(true);
		});

		it('should return true for add_shortcode', () => {
			expect(shouldUseMuPlugin('add_shortcode(\'myshortcode\', \'my_shortcode_handler\');')).toBe(true);
		});

		it('should return false for code without hook indicators', () => {
			expect(shouldUseMuPlugin('echo "Hello World";')).toBe(false);
			expect(shouldUseMuPlugin('$var = get_option(\'my_option\');')).toBe(false);
			expect(shouldUseMuPlugin('function test() { return true; }')).toBe(false);
		});

		it('should return true for multiline code with hooks', () => {
			const code = `
				function my_init_function() {
					// Do something
				}
				add_action('init', 'my_init_function');
			`;
			expect(shouldUseMuPlugin(code)).toBe(true);
		});

		it('should return true for complex code with multiple hooks', () => {
			const code = `
				add_action('init', 'setup');
				add_filter('the_content', 'filter_content');
				register_post_type('book', $args);
			`;
			expect(shouldUseMuPlugin(code)).toBe(true);
		});

		it('should handle empty string', () => {
			expect(shouldUseMuPlugin('')).toBe(false);
		});

		it('should be case-sensitive', () => {
			expect(shouldUseMuPlugin('ADD_ACTION(\'init\', \'test\');')).toBe(false);
		});

		it('should not match without opening parenthesis', () => {
			expect(shouldUseMuPlugin('my_add_action_wrapper();')).toBe(false);
			expect(shouldUseMuPlugin('// add_action in comment')).toBe(false);
		});

		it('should return true for any hook indicator', () => {
			expect(shouldUseMuPlugin('add_action(')).toBe(true);
			expect(shouldUseMuPlugin('just add_filter( here')).toBe(true);
		});

		it('should handle code with escaped quotes', () => {
			const code = 'add_action(\'init\', function() { echo "test"; });';
			expect(shouldUseMuPlugin(code)).toBe(true);
		});

		it('should require exact match with opening parenthesis', () => {
			// Spaces before paren = no match
			expect(shouldUseMuPlugin('add_action  (  \'init\', \'test\'  )')).toBe(false);
			// Direct paren = match
			expect(shouldUseMuPlugin('add_action(\'init\', \'test\')')).toBe(true);
			// Newline before paren = no match
			expect(shouldUseMuPlugin('add_filter\n(\n\'content\',\n\'filter\'\n)')).toBe(false);
			// Direct paren with newlines after = match
			expect(shouldUseMuPlugin('add_filter(\n\'content\',\n\'filter\'\n)')).toBe(true);
		});
	});
});
