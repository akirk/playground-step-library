import { describe, it, expect } from 'vitest';
import {
	detectUrlType,
	detectWpAdminUrl,
	detectHtml,
	detectPhp,
	isPlaygroundDomain,
	detectPlaygroundUrl,
	detectPlaygroundQueryApiUrl,
	detectBlueprintJson,
	detectStepLibraryRedirectUrl,
	normalizeWordPressUrl
} from './content-detection';

describe('content-detection', () => {
	describe('detectUrlType', () => {
		it('should detect WordPress.org plugin URLs', () => {
			expect(detectUrlType('https://wordpress.org/plugins/hello-dolly/')).toBe('plugin');
			expect(detectUrlType('http://wordpress.org/plugins/akismet/')).toBe('plugin');
		});

		it('should detect WordPress.org theme URLs', () => {
			expect(detectUrlType('https://wordpress.org/themes/twentytwentythree/')).toBe('theme');
			expect(detectUrlType('http://wordpress.org/themes/astra/')).toBe('theme');
		});

		it('should detect GitHub URLs as plugins', () => {
			expect(detectUrlType('https://github.com/user/repo')).toBe('plugin');
			expect(detectUrlType('http://github.com/wordpress/wordpress')).toBe('plugin');
		});

		it('should detect .zip URLs as plugins', () => {
			expect(detectUrlType('https://example.com/plugin.zip')).toBe('plugin');
			expect(detectUrlType('https://example.com/path/to/plugin.zip?v=1')).toBe('plugin');
		});

		it('should detect .tar.gz URLs as plugins', () => {
			expect(detectUrlType('https://example.com/plugin.tar.gz')).toBe('plugin');
			expect(detectUrlType('https://example.com/plugin.tgz')).toBe('plugin');
		});

		it('should detect generic HTTP URLs as plugins', () => {
			expect(detectUrlType('https://example.com/some-plugin')).toBe('plugin');
		});

		it('should return null for non-URL strings', () => {
			expect(detectUrlType('not a url')).toBe(null);
			expect(detectUrlType('hello-dolly')).toBe(null);
		});

		it('should return null for empty or null input', () => {
			expect(detectUrlType('')).toBe(null);
			expect(detectUrlType(null as any)).toBe(null);
			expect(detectUrlType(undefined as any)).toBe(null);
		});

		it('should handle whitespace', () => {
			expect(detectUrlType('  https://wordpress.org/plugins/test/  ')).toBe('plugin');
		});

		it('should return null for non-string input', () => {
			expect(detectUrlType(123 as any)).toBe(null);
			expect(detectUrlType({} as any)).toBe(null);
		});
	});

	describe('detectWpAdminUrl', () => {
		it('should detect /wp-admin/ paths', () => {
			expect(detectWpAdminUrl('/wp-admin/index.php')).toBe('/wp-admin/index.php');
			expect(detectWpAdminUrl('/wp-admin/')).toBe('/wp-admin/');
		});

		it('should detect /wp-login.php paths', () => {
			expect(detectWpAdminUrl('/wp-login.php')).toBe('/wp-login.php');
			expect(detectWpAdminUrl('/wp-login.php?action=logout')).toBe('/wp-login.php?action=logout');
		});

		it('should extract admin path from full URLs', () => {
			expect(detectWpAdminUrl('https://example.com/wp-admin/index.php')).toBe('/wp-admin/index.php');
			expect(detectWpAdminUrl('http://example.com/wp-login.php')).toBe('/wp-login.php');
		});

		it('should preserve query strings and hashes', () => {
			expect(detectWpAdminUrl('https://example.com/wp-admin/edit.php?post_type=page')).toContain('?post_type=page');
			expect(detectWpAdminUrl('https://example.com/wp-admin/#dashboard')).toContain('#dashboard');
		});

		it('should return null for non-admin URLs', () => {
			expect(detectWpAdminUrl('https://example.com/')).toBe(null);
			expect(detectWpAdminUrl('https://example.com/blog/')).toBe(null);
			expect(detectWpAdminUrl('/blog/')).toBe(null);
		});

		it('should return null for invalid URLs', () => {
			expect(detectWpAdminUrl('not a url')).toBe(null);
			expect(detectWpAdminUrl('')).toBe(null);
			expect(detectWpAdminUrl(null as any)).toBe(null);
		});

		it('should handle whitespace', () => {
			expect(detectWpAdminUrl('  /wp-admin/  ')).toBe('/wp-admin/');
		});
	});

	describe('detectHtml', () => {
		it('should detect HTML with closing tags', () => {
			expect(detectHtml('<div>Hello</div>')).toBe(true);
			expect(detectHtml('<p>Test</p>')).toBe(true);
			expect(detectHtml('<html><body></body></html>')).toBe(true);
		});

		it('should detect complex HTML', () => {
			expect(detectHtml('<div class="test"><span>Hello</span></div>')).toBe(true);
			expect(detectHtml('<a href="test">Link</a>')).toBe(true);
		});

		it('should not detect self-closing tags without closing tags', () => {
			expect(detectHtml('<br>')).toBe(false);
			expect(detectHtml('<img src="test.jpg">')).toBe(false);
		});

		it('should not detect text without HTML tags', () => {
			expect(detectHtml('Hello World')).toBe(false);
			expect(detectHtml('Just plain text')).toBe(false);
		});

		it('should not detect invalid HTML-like text', () => {
			expect(detectHtml('5 < 10')).toBe(false);
			expect(detectHtml('a < b > c')).toBe(false);
		});

		it('should handle whitespace', () => {
			expect(detectHtml('  <div>Test</div>  ')).toBe(true);
		});

		it('should return false for empty or null input', () => {
			expect(detectHtml('')).toBe(false);
			expect(detectHtml(null as any)).toBe(false);
			expect(detectHtml(undefined as any)).toBe(false);
		});

		it('should return false for non-string input', () => {
			expect(detectHtml(123 as any)).toBe(false);
		});
	});

	describe('detectPhp', () => {
		it('should detect PHP code starting with <?php', () => {
			expect(detectPhp('<?php echo "Hello"; ?>')).toBe(true);
			expect(detectPhp('<?php\n$var = 1;\n?>')).toBe(true);
		});

		it('should detect PHP code with opening and closing tags', () => {
			expect(detectPhp('Some text <?php echo "test"; ?> more text')).toBe(true);
			expect(detectPhp('  <?php function test() {} ?>  ')).toBe(true);
		});

		it('should not detect text without PHP tags', () => {
			expect(detectPhp('function test() {}')).toBe(false);
			expect(detectPhp('Hello World')).toBe(false);
		});

		it('should detect PHP code starting with <?php even without closing tag', () => {
			expect(detectPhp('<?php echo "test";')).toBe(true);
		});

		it('should not detect closing tag without opening tag', () => {
			expect(detectPhp('echo "test"; ?>')).toBe(false);
		});

		it('should handle whitespace', () => {
			expect(detectPhp('  <?php echo "test"; ?>  ')).toBe(true);
		});

		it('should return false for empty or null input', () => {
			expect(detectPhp('')).toBe(false);
			expect(detectPhp(null as any)).toBe(false);
			expect(detectPhp(undefined as any)).toBe(false);
		});

		it('should return false for non-string input', () => {
			expect(detectPhp(123 as any)).toBe(false);
		});
	});

	describe('isPlaygroundDomain', () => {
		it('should detect playground.wordpress.net', () => {
			expect(isPlaygroundDomain('playground.wordpress.net')).toBe(true);
		});

		it('should detect 127.0.0.1', () => {
			expect(isPlaygroundDomain('127.0.0.1')).toBe(true);
		});

		it('should not detect other domains', () => {
			expect(isPlaygroundDomain('wordpress.org')).toBe(false);
			expect(isPlaygroundDomain('example.com')).toBe(false);
			expect(isPlaygroundDomain('localhost')).toBe(false);
		});

		it('should not detect subdomains', () => {
			expect(isPlaygroundDomain('test.playground.wordpress.net')).toBe(false);
		});
	});

	describe('detectPlaygroundUrl', () => {
		it('should parse valid Playground URL with blueprint', () => {
			const blueprint = { steps: [] };
			const encoded = encodeURIComponent(JSON.stringify(blueprint));
			const url = `https://playground.wordpress.net/#${encoded}`;

			const result = detectPlaygroundUrl(url);
			expect(result).toEqual(blueprint);
		});

		it('should parse Playground URL from localhost', () => {
			const blueprint = { steps: [] };
			const encoded = encodeURIComponent(JSON.stringify(blueprint));
			const url = `http://127.0.0.1/#${encoded}`;

			const result = detectPlaygroundUrl(url);
			expect(result).toEqual(blueprint);
		});

		it('should return null for non-Playground domains', () => {
			const blueprint = { steps: [] };
			const encoded = encodeURIComponent(JSON.stringify(blueprint));
			const url = `https://example.com/#${encoded}`;

			expect(detectPlaygroundUrl(url)).toBe(null);
		});

		it('should return null for Playground URLs without hash', () => {
			expect(detectPlaygroundUrl('https://playground.wordpress.net/')).toBe(null);
			expect(detectPlaygroundUrl('https://playground.wordpress.net/#')).toBe(null);
		});

		it('should return null for invalid JSON in hash', () => {
			expect(detectPlaygroundUrl('https://playground.wordpress.net/#invalid-json')).toBe(null);
		});

		it('should return null for empty or null input', () => {
			expect(detectPlaygroundUrl('')).toBe(null);
			expect(detectPlaygroundUrl(null as any)).toBe(null);
			expect(detectPlaygroundUrl(undefined as any)).toBe(null);
		});

		it('should return null for non-URL strings', () => {
			expect(detectPlaygroundUrl('not a url')).toBe(null);
		});

		it('should parse complex blueprint data', () => {
			const blueprint = {
				steps: [
					{ step: 'login', username: 'admin' },
					{ step: 'installPlugin', pluginZipFile: { resource: 'url', url: 'test.zip' } }
				],
				landingPage: '/wp-admin/'
			};
			const encoded = encodeURIComponent(JSON.stringify(blueprint));
			const url = `https://playground.wordpress.net/#${encoded}`;

			const result = detectPlaygroundUrl(url);
			expect(result).toEqual(blueprint);
		});

		it('should parse base64-encoded blueprint', () => {
			const blueprint = { steps: [], landingPage: '/wp-admin/' };
			const base64 = btoa(JSON.stringify(blueprint));
			const url = `https://playground.wordpress.net/#${base64}`;

			const result = detectPlaygroundUrl(url);
			expect(result).toEqual(blueprint);
		});

		it('should parse base64-encoded blueprint with custom decoder', () => {
			const blueprint = { steps: [{ step: 'login' }] };
			const base64 = btoa(JSON.stringify(blueprint));
			const url = `https://playground.wordpress.net/#${base64}`;

			const customDecoder = (str: string) => atob(str);
			const result = detectPlaygroundUrl(url, customDecoder);
			expect(result).toEqual(blueprint);
		});

		it('should prefer URL-encoded over base64 when both could work', () => {
			const blueprint = { steps: [] };
			const encoded = encodeURIComponent(JSON.stringify(blueprint));
			const url = `https://playground.wordpress.net/#${encoded}`;

			const result = detectPlaygroundUrl(url);
			expect(result).toEqual(blueprint);
		});

		it('should return null for invalid base64 in hash', () => {
			expect(detectPlaygroundUrl('https://playground.wordpress.net/#not-valid-base64!!!')).toBe(null);
		});

		it('should return null for base64 that decodes to non-JSON', () => {
			const base64 = btoa('just plain text');
			expect(detectPlaygroundUrl(`https://playground.wordpress.net/#${base64}`)).toBe(null);
		});
	});

	describe('detectPlaygroundQueryApiUrl', () => {
		it('should detect Playground URLs with query parameters', () => {
			expect(detectPlaygroundQueryApiUrl('https://playground.wordpress.net/?plugin=hello-dolly')).toBe(true);
			expect(detectPlaygroundQueryApiUrl('http://127.0.0.1/?theme=twentytwentythree')).toBe(true);
		});

		it('should return false for Playground URLs without query parameters', () => {
			expect(detectPlaygroundQueryApiUrl('https://playground.wordpress.net/')).toBe(false);
			expect(detectPlaygroundQueryApiUrl('https://playground.wordpress.net/#hash')).toBe(false);
		});

		it('should return false for non-Playground domains', () => {
			expect(detectPlaygroundQueryApiUrl('https://example.com/?plugin=test')).toBe(false);
		});

		it('should return false for invalid URLs', () => {
			expect(detectPlaygroundQueryApiUrl('not a url')).toBe(false);
		});

		it('should return false for empty or null input', () => {
			expect(detectPlaygroundQueryApiUrl('')).toBe(false);
			expect(detectPlaygroundQueryApiUrl(null as any)).toBe(false);
			expect(detectPlaygroundQueryApiUrl(undefined as any)).toBe(false);
		});

		it('should handle complex query strings', () => {
			expect(detectPlaygroundQueryApiUrl('https://playground.wordpress.net/?plugin=test&theme=astra')).toBe(true);
		});
	});

	describe('detectBlueprintJson', () => {
		it('should detect valid blueprint JSON with steps', () => {
			const blueprint = { steps: [] };
			const json = JSON.stringify(blueprint);
			const result = detectBlueprintJson(json);
			expect(result).toEqual(blueprint);
		});

		it('should detect blueprint JSON with multiple properties', () => {
			const blueprint = {
				steps: [
					{ step: 'login', username: 'admin' }
				],
				landingPage: '/wp-admin/',
				preferredVersions: { php: '8.0', wp: '6.4' }
			};
			const json = JSON.stringify(blueprint);
			const result = detectBlueprintJson(json);
			expect(result).toEqual(blueprint);
		});

		it('should detect blueprint JSON with only landingPage', () => {
			const blueprint = { landingPage: '/wp-admin/' };
			const json = JSON.stringify(blueprint);
			const result = detectBlueprintJson(json);
			expect(result).toEqual(blueprint);
		});

		it('should detect blueprint JSON with only preferredVersions', () => {
			const blueprint = { preferredVersions: { php: '8.0' } };
			const json = JSON.stringify(blueprint);
			const result = detectBlueprintJson(json);
			expect(result).toEqual(blueprint);
		});

		it('should detect blueprint JSON with plugins', () => {
			const blueprint = { plugins: ['hello-dolly'] };
			const json = JSON.stringify(blueprint);
			const result = detectBlueprintJson(json);
			expect(result).toEqual(blueprint);
		});

		it('should return null for non-blueprint JSON objects', () => {
			const nonBlueprint = { foo: 'bar', baz: 123 };
			const json = JSON.stringify(nonBlueprint);
			expect(detectBlueprintJson(json)).toBe(null);
		});

		it('should return null for JSON arrays', () => {
			const arr = [1, 2, 3];
			const json = JSON.stringify(arr);
			expect(detectBlueprintJson(json)).toBe(null);
		});

		it('should return null for invalid JSON', () => {
			expect(detectBlueprintJson('{ invalid json }')).toBe(null);
			expect(detectBlueprintJson('{ "steps": }')).toBe(null);
		});

		it('should return null for non-JSON strings', () => {
			expect(detectBlueprintJson('not json')).toBe(null);
			expect(detectBlueprintJson('<?php echo "test"; ?>')).toBe(null);
			expect(detectBlueprintJson('<div>test</div>')).toBe(null);
		});

		it('should return null for strings not starting with {', () => {
			expect(detectBlueprintJson('  "steps": [] }')).toBe(null);
		});

		it('should return null for strings not ending with }', () => {
			expect(detectBlueprintJson('{ "steps": []  ')).toBe(null);
		});

		it('should handle whitespace', () => {
			const blueprint = { steps: [] };
			const json = '  ' + JSON.stringify(blueprint) + '  ';
			const result = detectBlueprintJson(json);
			expect(result).toEqual(blueprint);
		});

		it('should return null for empty or null input', () => {
			expect(detectBlueprintJson('')).toBe(null);
			expect(detectBlueprintJson(null as any)).toBe(null);
			expect(detectBlueprintJson(undefined as any)).toBe(null);
		});

		it('should return null for non-string input', () => {
			expect(detectBlueprintJson(123 as any)).toBe(null);
			expect(detectBlueprintJson({} as any)).toBe(null);
		});

		it('should handle complex nested blueprint structures', () => {
			const blueprint = {
				steps: [
					{
						step: 'installPlugin',
						pluginZipFile: { resource: 'url', url: 'test.zip' }
					}
				],
				landingPage: '/wp-admin/',
				preferredVersions: { php: '8.0', wp: '6.4' },
				features: { networking: true },
				siteOptions: { blogname: 'Test Site' }
			};
			const json = JSON.stringify(blueprint);
			const result = detectBlueprintJson(json);
			expect(result).toEqual(blueprint);
		});
	});

	describe('detectStepLibraryRedirectUrl', () => {
		it('should parse single step URL', () => {
			const url = 'https://example.com/?step[0]=installPlugin&url[0]=https://wordpress.org/plugins/akismet/';
			const result = detectStepLibraryRedirectUrl(url);
			expect(result).toEqual([
				{ step: 'installPlugin', vars: { url: 'https://wordpress.org/plugins/akismet/' } }
			]);
		});

		it('should parse multiple steps URL', () => {
			const url = 'https://akirk.github.io/playground-step-library/?step[0]=installPlugin&url[0]=wordpress.org/plugins/litespeed-cache/&step[1]=setLandingPage&landingPage[1]=/wp-admin/admin.php?page=litespeed';
			const result = detectStepLibraryRedirectUrl(url);
			expect(result).toEqual([
				{ step: 'installPlugin', vars: { url: 'wordpress.org/plugins/litespeed-cache/' } },
				{ step: 'setLandingPage', vars: { landingPage: '/wp-admin/admin.php?page=litespeed' } }
			]);
		});

		it('should parse steps with multiple vars', () => {
			const url = 'https://example.com/?step[0]=login&username[0]=admin&password[0]=secret';
			const result = detectStepLibraryRedirectUrl(url);
			expect(result).toEqual([
				{ step: 'login', vars: { username: 'admin', password: 'secret' } }
			]);
		});

		it('should handle non-sequential indices', () => {
			const url = 'https://example.com/?step[0]=first&step[2]=third&url[0]=a&url[2]=c';
			const result = detectStepLibraryRedirectUrl(url);
			expect(result).toEqual([
				{ step: 'first', vars: { url: 'a' } },
				{ step: 'third', vars: { url: 'c' } }
			]);
		});

		it('should return null for URLs without step parameters', () => {
			expect(detectStepLibraryRedirectUrl('https://example.com/?foo=bar')).toBe(null);
			expect(detectStepLibraryRedirectUrl('https://example.com/')).toBe(null);
		});

		it('should return null for invalid URLs', () => {
			expect(detectStepLibraryRedirectUrl('not a url')).toBe(null);
		});

		it('should return null for empty or null input', () => {
			expect(detectStepLibraryRedirectUrl('')).toBe(null);
			expect(detectStepLibraryRedirectUrl(null as any)).toBe(null);
			expect(detectStepLibraryRedirectUrl(undefined as any)).toBe(null);
		});

		it('should handle URL-encoded values', () => {
			const url = 'https://example.com/?step[0]=addPost&title[0]=Hello%20World&content[0]=Test%3Chtml%3E';
			const result = detectStepLibraryRedirectUrl(url);
			expect(result).toEqual([
				{ step: 'addPost', vars: { title: 'Hello World', content: 'Test<html>' } }
			]);
		});

		it('should return empty vars for steps without additional parameters', () => {
			const url = 'https://example.com/?step[0]=login';
			const result = detectStepLibraryRedirectUrl(url);
			expect(result).toEqual([
				{ step: 'login', vars: {} }
			]);
		});

		it('should handle whitespace in URL', () => {
			const url = '  https://example.com/?step[0]=login  ';
			const result = detectStepLibraryRedirectUrl(url);
			expect(result).toEqual([
				{ step: 'login', vars: {} }
			]);
		});
	});

	describe('normalizeWordPressUrl', () => {
		it('should normalize downloads.wordpress.org plugin URL to wordpress.org', () => {
			const url = 'https://downloads.wordpress.org/plugin/hello-dolly.1.7.2.zip';
			const normalized = normalizeWordPressUrl(url, 'plugin');
			expect(normalized).toBe('https://wordpress.org/plugins/hello-dolly/');
		});

		it('should normalize downloads.wordpress.org plugin URL with latest-stable', () => {
			const url = 'https://downloads.wordpress.org/plugin/nosuchplugin.latest-stable.zip';
			const normalized = normalizeWordPressUrl(url, 'plugin');
			expect(normalized).toBe('https://wordpress.org/plugins/nosuchplugin/');
		});

		it('should normalize downloads.wordpress.org theme URL to wordpress.org', () => {
			const url = 'https://downloads.wordpress.org/theme/twentytwentyfour.1.0.zip';
			const normalized = normalizeWordPressUrl(url, 'theme');
			expect(normalized).toBe('https://wordpress.org/themes/twentytwentyfour/');
		});

		it('should normalize http downloads.wordpress.org URLs', () => {
			const url = 'http://downloads.wordpress.org/plugin/woocommerce.8.5.2.zip';
			const normalized = normalizeWordPressUrl(url, 'plugin');
			expect(normalized).toBe('https://wordpress.org/plugins/woocommerce/');
		});

		it('should not modify non-downloads.wordpress.org URLs', () => {
			const url = 'https://wordpress.org/plugins/hello-dolly/';
			const normalized = normalizeWordPressUrl(url, 'plugin');
			expect(normalized).toBe('https://wordpress.org/plugins/hello-dolly/');
		});

		it('should not modify GitHub URLs', () => {
			const url = 'https://github.com/user/repo';
			const normalized = normalizeWordPressUrl(url, 'plugin');
			expect(normalized).toBe('https://github.com/user/repo');
		});

		it('should not modify other ZIP URLs', () => {
			const url = 'https://example.com/my-plugin.zip';
			const normalized = normalizeWordPressUrl(url, 'plugin');
			expect(normalized).toBe('https://example.com/my-plugin.zip');
		});

		it('should return original URL if urlType is null', () => {
			const url = 'https://downloads.wordpress.org/plugin/test.zip';
			const normalized = normalizeWordPressUrl(url, null);
			expect(normalized).toBe('https://downloads.wordpress.org/plugin/test.zip');
		});

		it('should return original URL if url is empty', () => {
			const url = '';
			const normalized = normalizeWordPressUrl(url, 'plugin');
			expect(normalized).toBe('');
		});
	});
});
