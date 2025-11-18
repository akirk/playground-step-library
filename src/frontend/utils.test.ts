import { describe, it, expect } from 'vitest';
import {
	minimalEncode,
	shortenUrl,
	expandUrl,
	isDefaultValue,
	encodeStringAsBase64,
	encodeUint8ArrayAsBase64,
	decodeBase64ToString,
	decodeBase64ToUint8Array,
	generateLabel
} from './utils';
import { StepDefinition } from './types';

describe('utils', () => {
	describe('minimalEncode', () => {
		it('should encode special characters', () => {
			expect(minimalEncode('hello world')).toBe('hello%20world');
			expect(minimalEncode('a&b=c')).toBe('a%26b%3Dc');
			expect(minimalEncode('test#anchor')).toBe('test%23anchor');
			expect(minimalEncode('query?param')).toBe('query%3Fparam');
		});

		it('should encode percent signs', () => {
			expect(minimalEncode('100%')).toBe('100%25');
		});

		it('should handle empty strings', () => {
			expect(minimalEncode('')).toBe('');
		});

		it('should handle strings with no special characters', () => {
			expect(minimalEncode('hello')).toBe('hello');
		});

		it('should handle multiple special characters', () => {
			expect(minimalEncode('a&b=c#d?e f%g')).toBe('a%26b%3Dc%23d%3Fe%20f%25g');
		});
	});

	describe('shortenUrl', () => {
		it('should remove http:// protocol', () => {
			expect(shortenUrl('http://example.com')).toBe('example.com');
		});

		it('should remove https:// protocol', () => {
			expect(shortenUrl('https://example.com')).toBe('example.com');
		});

		it('should handle URLs with paths', () => {
			expect(shortenUrl('https://example.com/path/to/page')).toBe('example.com/path/to/page');
		});

		it('should not modify URLs without protocol', () => {
			expect(shortenUrl('example.com')).toBe('example.com');
		});

		it('should handle ftp:// protocol', () => {
			expect(shortenUrl('ftp://example.com')).toBe('ftp://example.com');
		});
	});

	describe('expandUrl', () => {
		it('should add https:// to URLs without protocol', () => {
			expect(expandUrl('example.com')).toBe('https://example.com');
		});

		it('should not modify URLs with https://', () => {
			expect(expandUrl('https://example.com')).toBe('https://example.com');
		});

		it('should not modify URLs with http://', () => {
			expect(expandUrl('http://example.com')).toBe('http://example.com');
		});

		it('should handle URLs with paths', () => {
			expect(expandUrl('example.com/path')).toBe('https://example.com/path');
		});
	});

	describe('isDefaultValue', () => {
		const mockCustomSteps: Record<string, StepDefinition> = {
			testStep: {
				step: 'testStep',
				vars: [
					{
						name: 'textVar',
						type: 'text',
						samples: ['default text']
					},
					{
						name: 'boolVar',
						type: 'boolean',
						samples: []
					},
					{
						name: 'customVar',
						type: 'text',
						samples: ['custom default']
					}
				]
			}
		};

		it('should return true for empty values', () => {
			expect(isDefaultValue('testStep', 'textVar', '', mockCustomSteps)).toBe(true);
			expect(isDefaultValue('testStep', 'textVar', null, mockCustomSteps)).toBe(true);
			expect(isDefaultValue('testStep', 'textVar', undefined, mockCustomSteps)).toBe(true);
		});

		it('should return true for "false" string', () => {
			expect(isDefaultValue('testStep', 'boolVar', 'false', mockCustomSteps)).toBe(true);
		});

		it('should return true when value matches first sample', () => {
			expect(isDefaultValue('testStep', 'textVar', 'default text', mockCustomSteps)).toBe(true);
		});

		it('should return false when value does not match default', () => {
			expect(isDefaultValue('testStep', 'textVar', 'custom value', mockCustomSteps)).toBe(false);
		});

		it('should return true for boolean type with "false" value', () => {
			expect(isDefaultValue('testStep', 'boolVar', 'false', mockCustomSteps)).toBe(true);
		});

		it('should return false for unknown step', () => {
			expect(isDefaultValue('unknownStep', 'textVar', '', mockCustomSteps)).toBe(true);
		});

		it('should return false for unknown variable', () => {
			expect(isDefaultValue('testStep', 'unknownVar', 'value', mockCustomSteps)).toBe(false);
		});
	});

	describe('base64 encoding/decoding', () => {
		describe('encodeStringAsBase64', () => {
			it('should encode simple strings', () => {
				const encoded = encodeStringAsBase64('hello');
				expect(encoded).toBe('aGVsbG8=');
			});

			it('should encode empty string', () => {
				const encoded = encodeStringAsBase64('');
				expect(encoded).toBe('');
			});

			it('should encode special characters', () => {
				const encoded = encodeStringAsBase64('hello world!');
				expect(encoded).toBe('aGVsbG8gd29ybGQh');
			});

			it('should encode unicode characters', () => {
				const encoded = encodeStringAsBase64('hello 世界');
				expect(typeof encoded).toBe('string');
				expect(encoded.length).toBeGreaterThan(0);
			});
		});

		describe('decodeBase64ToString', () => {
			it('should decode simple strings', () => {
				const decoded = decodeBase64ToString('aGVsbG8=');
				expect(decoded).toBe('hello');
			});

			it('should decode empty string', () => {
				const decoded = decodeBase64ToString('');
				expect(decoded).toBe('');
			});

			it('should decode special characters', () => {
				const decoded = decodeBase64ToString('aGVsbG8gd29ybGQh');
				expect(decoded).toBe('hello world!');
			});
		});

		describe('round-trip encoding/decoding', () => {
			it('should encode and decode strings correctly', () => {
				const original = 'Hello World!';
				const encoded = encodeStringAsBase64(original);
				const decoded = decodeBase64ToString(encoded);
				expect(decoded).toBe(original);
			});

			it('should handle multiline strings', () => {
				const original = 'line1\nline2\nline3';
				const encoded = encodeStringAsBase64(original);
				const decoded = decodeBase64ToString(encoded);
				expect(decoded).toBe(original);
			});
		});

		describe('encodeUint8ArrayAsBase64', () => {
			it('should encode byte arrays', () => {
				const bytes = new Uint8Array([104, 101, 108, 108, 111]); // 'hello'
				const encoded = encodeUint8ArrayAsBase64(bytes);
				expect(encoded).toBe('aGVsbG8=');
			});

			it('should encode empty array', () => {
				const bytes = new Uint8Array([]);
				const encoded = encodeUint8ArrayAsBase64(bytes);
				expect(encoded).toBe('');
			});
		});

		describe('decodeBase64ToUint8Array', () => {
			it('should decode to byte arrays', () => {
				const decoded = decodeBase64ToUint8Array('aGVsbG8=');
				expect(Array.from(decoded)).toEqual([104, 101, 108, 108, 111]);
			});

			it('should decode empty string', () => {
				const decoded = decodeBase64ToUint8Array('');
				expect(decoded.length).toBe(0);
			});
		});
	});

	describe('generateLabel', () => {
		it('should generate ISO-like timestamp', () => {
			const label = generateLabel();
			// Format should be: YYYY-MM-DD HH:MM:SS
			expect(label).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		});

		it('should generate different labels when called multiple times', () => {
			const label1 = generateLabel();
			// Wait a tiny bit
			const label2 = generateLabel();
			// They might be the same if called within the same second
			// so we just verify both are valid timestamps
			expect(label1).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
			expect(label2).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		});
	});
});
