import { describe, it, expect, beforeAll } from 'vitest';
import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import PlaygroundStepLibrary from '../lib/src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Blueprint Schema Validation', () => {
	let ajv;
	let validate;
	let library;

	beforeAll(() => {
		const schemaPath = join(__dirname, 'fixtures', 'blueprint-schema.json');
		const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

		ajv = new Ajv({ strict: false });
		validate = ajv.compile(schema);
		library = new PlaygroundStepLibrary();
	});

	it('should have a valid blueprint schema loaded', () => {
		expect(validate).toBeDefined();
		expect(typeof validate).toBe('function');
	});

	it('should validate a simple compiled blueprint with installPlugin', () => {
		const blueprint = {
			steps: [
				{
					step: 'installPlugin',
					vars: {
						url: 'akismet'
					}
				}
			]
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a compiled blueprint with multiple plugins', () => {
		const blueprint = {
			steps: [
				{
					step: 'installPlugin',
					vars: {
						url: 'akismet'
					}
				},
				{
					step: 'installPlugin',
					vars: {
						url: 'hello-dolly'
					}
				}
			]
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a comprehensive compiled blueprint', () => {
		const blueprint = {
			steps: [
				{
					step: 'installPlugin',
					vars: {
						url: 'https://wordpress.org/plugins/akismet/'
					}
				},
				{
					step: 'setSiteName',
					vars: {
						sitename: 'My Test Site',
						tagline: 'Just testing'
					}
				},
				{
					step: 'runPHP',
					code: '<?php echo "Hello World";'
				},
				{
					step: 'setLandingPage',
					vars: {
						landingPage: '/wp-admin/'
					}
				}
			]
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with login and siteOptions', () => {
		const blueprint = {
			steps: [
				{
					step: 'login',
					vars: {
						username: 'admin',
						password: 'password'
					}
				},
				{
					step: 'setSiteOption',
					vars: {
						name: 'permalink_structure',
						value: '/%postname%/'
					}
				}
			]
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with debug step (defineWpConfigConsts)', () => {
		const blueprint = {
			steps: [
				{
					step: 'debug',
					vars: {
						wpDebug: true,
						wpDebugDisplay: true,
						scriptDebug: true,
						queryMonitor: false
					}
				}
			]
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with GitHub PR plugin', () => {
		const blueprint = {
			steps: [
				{
					step: 'installPlugin',
					vars: {
						url: 'https://github.com/WordPress/gutenberg/pull/12345',
						auth: true
					}
				}
			]
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with addPage step (runPHP)', () => {
		const blueprint = {
			steps: [
				{
					step: 'addPage',
					vars: {
						title: 'Test Page',
						content: 'This is test content'
					}
				}
			]
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate an empty blueprint', () => {
		const blueprint = {
			steps: []
		};

		const compiled = library.compile(blueprint);
		const valid = validate(compiled);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with landingPage at top level', () => {
		const blueprint = {
			landingPage: '/wp-admin/'
		};

		const valid = validate(blueprint);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with preferredVersions', () => {
		const blueprint = {
			preferredVersions: {
				php: '8.2',
				wp: '6.7'
			},
			steps: []
		};

		const valid = validate(blueprint);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with login as boolean', () => {
		const blueprint = {
			login: true,
			steps: []
		};

		const valid = validate(blueprint);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});

	it('should validate a blueprint with constants', () => {
		const blueprint = {
			constants: {
				WP_DEBUG: true,
				WP_DEBUG_DISPLAY: false
			},
			steps: []
		};

		const valid = validate(blueprint);

		if (!valid) {
			console.error('Validation errors:', validate.errors);
		}
		expect(valid).toBe(true);
	});
});
