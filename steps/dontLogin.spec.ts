import { describe, it, expect } from 'vitest';
import { dontLogin } from './dontLogin.js';

describe('dontLogin', () => {
	it('should set login to false', () => {
		const result = dontLogin({ step: 'dontLogin' }) as any;
		expect(result.login).toBe(false);
		expect(result.length).toBe(0);
	});

	it('should have correct description', () => {
		expect(dontLogin.description).toBe('Prevent automatic login (Playground logs in as admin by default).');
	});

	it('should have no required variables', () => {
		expect(dontLogin.vars).toEqual([]);
	});
});
