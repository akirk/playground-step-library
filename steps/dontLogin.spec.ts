import { describe, it, expect } from 'vitest';
import { dontLogin } from './dontLogin.js';

describe('dontLogin', () => {
	describe('toV1()', () => {
		it('should set login to false', () => {
			const result = dontLogin({ step: 'dontLogin' }).toV1();
			expect(result.login).toBe(false);
			expect(result.steps).toBeUndefined();
		});
	});

	describe('toV2()', () => {
		it('should set login to false via applicationOptions', () => {
			const result = dontLogin({ step: 'dontLogin' }).toV2();

			expect(result.version).toBe(2);
			expect(result.applicationOptions).toBeDefined();
			expect(result.applicationOptions['wordpress-playground'].login).toBe(false);
		});
	});

	it('should have correct description', () => {
		expect(dontLogin.description).toBe('Prevent automatic login (Playground logs in as admin by default).');
	});

	it('should have no required variables', () => {
		expect(dontLogin.vars).toEqual([]);
	});
});
