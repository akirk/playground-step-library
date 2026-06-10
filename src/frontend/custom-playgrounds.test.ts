import { describe, it, expect, beforeEach } from 'vitest';
import {
	addCustomPlayground,
	getCustomPlaygrounds,
	normalizeCustomPlaygroundUrl
} from './custom-playgrounds';

describe('custom-playgrounds', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	describe('normalizeCustomPlaygroundUrl', () => {
		it('should preserve https URLs', () => {
			expect(normalizeCustomPlaygroundUrl('https://wordpress.com/setup/onboarding/playground')).toBe(
				'https://wordpress.com/setup/onboarding/playground'
			);
		});

		it('should preserve http URLs', () => {
			expect(normalizeCustomPlaygroundUrl('http://localhost:5400')).toBe('http://localhost:5400');
		});

		it('should add https to URLs without a protocol', () => {
			expect(normalizeCustomPlaygroundUrl('wordpress.com/setup/onboarding/playground')).toBe(
				'https://wordpress.com/setup/onboarding/playground'
			);
		});

		it('should trim whitespace and trailing slashes', () => {
			expect(normalizeCustomPlaygroundUrl(' https://wordpress.com/setup/onboarding/playground/ ')).toBe(
				'https://wordpress.com/setup/onboarding/playground'
			);
		});
	});

	describe('addCustomPlayground', () => {
		it('should store normalized playground URLs', () => {
			addCustomPlayground('wordpress.com/setup/onboarding/playground/');

			expect(getCustomPlaygrounds()).toEqual([
				{
					url: 'https://wordpress.com/setup/onboarding/playground',
					name: 'https://wordpress.com/setup/onboarding/playground'
				}
			]);
		});
	});
});
