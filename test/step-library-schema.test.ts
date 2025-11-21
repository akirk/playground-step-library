import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import PlaygroundStepLibrary from '../src/index';

describe('Step Library Schema', () => {
	const schemaPath = path.join(__dirname, '../step-library-schema.json');
	const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
	const ajv = new Ajv();
	const validate = ajv.compile(schema);

	describe('schema validation', () => {
		it('should validate a minimal blueprint', () => {
			const blueprint = {
				steps: []
			};
			expect(validate(blueprint)).toBe(true);
		});

		it('should validate a blueprint with $schema', () => {
			const blueprint = {
				$schema: 'https://akirk.github.io/playground-step-library/step-library-schema.json',
				steps: []
			};
			expect(validate(blueprint)).toBe(true);
		});

		it('should validate a blueprint with meta', () => {
			const blueprint = {
				meta: { title: 'Test Blueprint' },
				steps: []
			};
			expect(validate(blueprint)).toBe(true);
		});

		it('should validate a blueprint with steps using vars', () => {
			const blueprint = {
				steps: [
					{
						step: 'setSiteName',
						vars: {
							sitename: 'My Site',
							tagline: 'A tagline'
						}
					}
				]
			};
			expect(validate(blueprint)).toBe(true);
		});

		it('should validate a blueprint with flat step properties', () => {
			const blueprint = {
				steps: [
					{
						step: 'setSiteName',
						sitename: 'My Site',
						tagline: 'A tagline'
					}
				]
			};
			expect(validate(blueprint)).toBe(true);
		});

		it('should validate a blueprint with preferredVersions', () => {
			const blueprint = {
				preferredVersions: {
					wp: '6.4',
					php: '8.2'
				},
				steps: []
			};
			expect(validate(blueprint)).toBe(true);
		});

		it('should reject a blueprint without steps', () => {
			const blueprint = {
				meta: { title: 'Test' }
			};
			expect(validate(blueprint)).toBe(false);
		});

		it('should reject a step without step property', () => {
			const blueprint = {
				steps: [
					{ vars: { sitename: 'Test' } }
				]
			};
			expect(validate(blueprint)).toBe(false);
		});
	});

	describe('example files', () => {
		const examplesDir = path.join(__dirname, '../src/examples');
		const exampleFiles = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));

		exampleFiles.forEach(file => {
			it(`should validate ${file}`, () => {
				const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
				const blueprint = JSON.parse(content);
				const valid = validate(blueprint);
				if (!valid) {
					console.log('Validation errors:', validate.errors);
				}
				expect(valid).toBe(true);
			});

			it(`should compile ${file} to V1`, () => {
				const compiler = new PlaygroundStepLibrary();
				const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
				const blueprint = JSON.parse(content);
				const compiled = compiler.compile(blueprint);
				expect(compiled.steps).toBeDefined();
				expect(Array.isArray(compiled.steps)).toBe(true);
			});

			it(`should compile ${file} to V2`, () => {
				const compiler = new PlaygroundStepLibrary();
				const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
				const blueprint = JSON.parse(content);
				const compiled = compiler.compileV2(blueprint);
				expect(compiled.version).toBe(2);
			});
		});
	});
});
