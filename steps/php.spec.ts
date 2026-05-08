import { describe, it, expect } from 'vitest';
import { escapePhpSingleQuotedString } from './php.js';

describe('PHP helpers', () => {
	it('should escape strings for PHP single-quoted literals', () => {
		expect(escapePhpSingleQuotedString(String.raw`C:\tmp\John's $file`)).toBe(String.raw`C:\\tmp\\John\'s $file`);
	});

	it('should preserve newlines in single-quoted strings', () => {
		expect(escapePhpSingleQuotedString("First line\nSecond line")).toBe("First line\nSecond line");
	});
});
