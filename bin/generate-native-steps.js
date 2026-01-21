#!/usr/bin/env node

/**
 * Generate step-library wrappers for native Playground steps
 *
 * This script reads the @wp-playground/blueprints type definitions and generates
 * step-library wrapper files for native steps that don't have advanced equivalents.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const blueprintsStepsDir = path.join(__dirname, '../node_modules/@wp-playground/blueprints/lib/steps');
const stepsDir = path.join(__dirname, '../steps');
const registryFile = path.join(stepsDir, '../src/steps-registry.ts');

// Steps that have advanced step-library equivalents (don't generate wrappers for these)
const ADVANCED_EQUIVALENTS = {
	'define-wp-config-consts': 'defineWpConfigConst', // singular version with better UI
	'set-site-language': 'setLanguage',
	'wp-cli': 'runWpCliCommand',
	// These have extended functionality in step-library
	'install-plugin': 'installPlugin',
	'install-theme': 'installTheme',
	'import-wxr': 'importWxr',
	'run-php': 'runPHP',
	'login': 'login',
	'enable-multisite': 'enableMultisite',
};

// Steps to skip entirely (internal/helper steps)
const SKIP_STEPS = [
	'index',
	'handlers',
	'install-asset',
	'run-php-with-options',
	'site-data',
];

// Map from filename to step name
function fileNameToStepName(fileName) {
	// Convert kebab-case to camelCase
	return fileName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Parse a .d.ts file to extract step interface info
function parseStepDefinition(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');

	// Extract interface name and properties
	const interfaceMatch = content.match(/export interface (\w+)(?:<[^>]+>)?\s*\{([^}]+)\}/s);
	if (!interfaceMatch) {
		return null;
	}

	const interfaceName = interfaceMatch[1];
	const interfaceBody = interfaceMatch[2];

	// Extract step name from interface
	const stepMatch = interfaceBody.match(/step:\s*['"](\w+)['"]/);
	if (!stepMatch) {
		return null;
	}
	const stepName = stepMatch[1];

	// Extract description from JSDoc
	const descMatch = content.match(/\/\*\*[\s\S]*?\*\s+([A-Z][^@*\n]+)/);
	const description = descMatch ? descMatch[1].trim().replace(/\.$/, '') : `Execute the ${stepName} step`;

	// Extract properties
	const properties = [];
	const propRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(\w+)(\?)?:\s*([^;]+);/g;
	let match;

	while ((match = propRegex.exec(interfaceBody)) !== null) {
		const [, docComment, propName, optional, propType] = match;

		if (propName === 'step') continue;

		// Extract description from doc comment
		let propDesc = '';
		if (docComment) {
			const descLine = docComment.match(/\*\s*([^@\n]+)/);
			if (descLine) {
				propDesc = descLine[1].trim();
			}
		}

		// Check for deprecation
		const isDeprecated = docComment && docComment.includes('@deprecated');

		properties.push({
			name: propName,
			type: propType.trim(),
			required: !optional,
			description: propDesc,
			deprecated: isDeprecated,
		});
	}

	return {
		stepName,
		interfaceName,
		description,
		properties,
	};
}

// Generate TypeScript step file content
function generateStepFile(stepInfo) {
	const { stepName, description, properties } = stepInfo;

	// Generate interface name
	const interfaceName = stepName.charAt(0).toUpperCase() + stepName.slice(1) + 'Step';

	// Check what imports are needed
	const hasFileRef = needsFileReference(properties);
	const hasPHPRequest = needsPHPRequestData(properties);

	// Build imports
	const typeImports = ['StepFunction', 'BlueprintStep', 'StepResult'];
	if (hasFileRef) {
		typeImports.push('FileReference');
	}

	// Generate vars interface properties
	const varsProps = properties
		.filter(p => !p.deprecated)
		.map(p => `\t${p.name}${p.required ? '' : '?'}: ${simplifyType(p.type)};`)
		.join('\n');

	// Generate vars array for step function
	const varsArray = properties
		.filter(p => !p.deprecated)
		.map(p => {
			const varDef = [`\t{\n\t\tname: '${p.name}'`];
			if (p.description) {
				varDef.push(`\t\tdescription: '${escapeString(p.description)}'`);
			}
			if (p.required) {
				varDef.push(`\t\trequired: true`);
			}
			varDef.push('\t}');
			return varDef.join(',\n');
		})
		.join(',\n');

	// Generate step properties for toV1
	const stepProps = properties
		.filter(p => !p.deprecated)
		.map(p => `\t\t\t\t\t${p.name}: step.${p.name}`)
		.join(',\n');

	// Generate PHPRequestData interface if needed
	const phpRequestInterface = hasPHPRequest ? `
export interface PHPRequestData {
	method?: 'GET' | 'POST' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'PUT' | 'DELETE';
	url: string;
	headers?: Record<string, string>;
	body?: string;
	formData?: Record<string, unknown>;
}
` : '';

	return `import type { ${typeImports.join(', ')} } from './types.js';
import { v1ToV2Fallback } from './types.js';
${phpRequestInterface}
export interface ${interfaceName} extends BlueprintStep {
${varsProps}
}

export const ${stepName}: StepFunction<${interfaceName}> = ( step: ${interfaceName} ): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: '${stepName}',
${stepProps}
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

${stepName}.description = '${escapeString(description)}.';
${stepName}.hidden = true;
${stepName}.vars = [
${varsArray}
];
`;
}

// Simplify TypeScript types for our purposes
function simplifyType(type) {
	// Handle generic resource types - use FileReference from types.js
	if (type.includes('ResourceType') || type.includes('FileResource')) {
		return 'FileReference';
	}
	// Handle File type (browser File object used as resource)
	if (type === 'File') {
		return 'FileReference';
	}
	// Handle directory resource types
	if (type.includes('DirectoryResource') || type.includes('Directory')) {
		return 'FileReference';
	}
	// Handle union types with Uint8Array
	if (type.includes('Uint8Array')) {
		return 'FileReference | string | Uint8Array';
	}
	// Handle PHPRequest type
	if (type.includes('PHPRequest')) {
		return 'PHPRequestData';
	}
	return type;
}

// Check if type requires FileReference import
function needsFileReference(properties) {
	return properties.some(p => {
		const simplified = simplifyType(p.type);
		return simplified.includes('FileReference');
	});
}

// Check if type needs PHPRequestData
function needsPHPRequestData(properties) {
	return properties.some(p => simplifyType(p.type) === 'PHPRequestData');
}

// Escape string for use in template literal
function escapeString(str) {
	return str.replace(/'/g, "\\'").replace(/\n/g, ' ');
}

// Check if a step already exists in the steps directory
function stepExists(stepName) {
	const filePath = path.join(stepsDir, `${stepName}.ts`);
	return fs.existsSync(filePath);
}

// Main function
async function main() {
	console.log('Scanning native Playground steps...\n');

	const files = fs.readdirSync(blueprintsStepsDir)
		.filter(f => f.endsWith('.d.ts') && !SKIP_STEPS.includes(f.replace('.d.ts', '')));

	const generated = [];
	const skipped = [];
	const existing = [];

	for (const file of files) {
		const fileName = file.replace('.d.ts', '');
		const stepName = fileNameToStepName(fileName);

		// Skip if has advanced equivalent
		if (ADVANCED_EQUIVALENTS[fileName]) {
			skipped.push({ stepName, reason: `has advanced equivalent: ${ADVANCED_EQUIVALENTS[fileName]}` });
			continue;
		}

		// Skip if already exists
		if (stepExists(stepName)) {
			existing.push(stepName);
			continue;
		}

		// Parse the step definition
		const filePath = path.join(blueprintsStepsDir, file);
		const stepInfo = parseStepDefinition(filePath);

		if (!stepInfo) {
			skipped.push({ stepName, reason: 'could not parse definition' });
			continue;
		}

		// Generate the step file
		const content = generateStepFile(stepInfo);
		const outputPath = path.join(stepsDir, `${stepName}.ts`);

		fs.writeFileSync(outputPath, content);
		generated.push(stepName);
		console.log(`Generated: ${stepName}.ts`);
	}

	console.log('\n--- Summary ---');
	console.log(`Generated: ${generated.length} files`);
	console.log(`Already exist: ${existing.length} files`);
	console.log(`Skipped: ${skipped.length} files`);

	if (skipped.length > 0) {
		console.log('\nSkipped steps:');
		skipped.forEach(s => console.log(`  - ${s.stepName}: ${s.reason}`));
	}

	if (generated.length > 0) {
		console.log('\n--- Registry Update Needed ---');
		console.log('Add the following imports to src/steps-registry.ts:\n');
		generated.forEach(s => console.log(`import { ${s} } from '../steps/${s}.js';`));
		console.log('\nAnd add to stepsRegistry object:');
		generated.forEach(s => console.log(`    ${s},`));
	}
}

main().catch(console.error);
