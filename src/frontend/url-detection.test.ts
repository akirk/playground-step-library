import { describe, it, expect } from 'vitest';
import {
	detectUrlType,
	detectWpAdminUrl,
	detectHtml,
	detectPhp,
	isPlaygroundDomain,
	detectPlaygroundUrl,
	detectPlaygroundQueryApiUrl
} from './url-detection';

describe('url-detection', () => {
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
});
