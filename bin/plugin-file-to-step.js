import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Specify the directory containing the steps
const stepsDir = "steps";

// chdir into the directory where this script lives
process.chdir( __dirname + '/..' );

// Function to convert a string to camelCase
function toCamelCase(str) {
    return str.replace(/([-_]\w)/g, g => g[1].toUpperCase());
}

const phpFilename = process.argv[2];

// Read the contents of the PHP file
const phpContents = fs.readFileSync(phpFilename, 'utf-8').replace( /`/g, '\\`' ).replace( /\\/g, '\\\\' )

// Derive the JS filename
const baseName = path.basename(phpFilename, '.php');
const camelCaseName = toCamelCase(baseName);

// Create the JavaScript content
const jsContent = `export function ${camelCaseName}() {
	const steps = [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/${baseName}.php",
			"data": \`${phpContents}\`
		}
	];
	return steps;
}

${camelCaseName}.description = "Auto-generated from ${baseName}.php";
${camelCaseName}.vars = [];
`;

// Write the JavaScript content to a file
const jsFilename = `steps/${camelCaseName}.js`;
fs.writeFileSync(jsFilename, jsContent);

console.log(`JavaScript file created: ${jsFilename}`);

// Create TypeScript declaration file
const declarationContent = `import type { StepFunction } from '../types.js';\n\nexport const ${camelCaseName}: StepFunction;\n`;
fs.writeFileSync(`steps/${camelCaseName}.d.ts`, declarationContent);
console.log(`TypeScript declaration created: steps/${camelCaseName}.d.ts`);

// Update src/steps-registry.ts to include the new step
const registryPath = path.join( process.cwd(), 'src', 'steps-registry.ts' );
let registryContent = fs.readFileSync( registryPath, 'utf-8' );

// Add import statement after the last import
const newImport = `import { ${camelCaseName} } from '../steps/${camelCaseName}.js';`;

if ( registryContent.includes( newImport ) ) {
	console.log( `Import for ${camelCaseName} already exists in src/steps-registry.ts` );
} else {
	// Find the last import statement and add after it
	const lastImportMatch = registryContent.match( /(import \\{[^}]+\\} from '[^']+';)(?!\\n*import)/g );
	if ( lastImportMatch ) {
		const lastImport = lastImportMatch[lastImportMatch.length - 1];
		const lastImportIndex = registryContent.lastIndexOf( lastImport );
		const insertIndex = lastImportIndex + lastImport.length;
		registryContent = registryContent.slice( 0, insertIndex ) + '\\n' + newImport + registryContent.slice( insertIndex );
		console.log( `Added import statement for ${camelCaseName} to src/steps-registry.ts` );
	}
}

// Add to registry object
const registryEndRegex = /(skipWooCommerceWizard,\\s*\\n\\s*}\\s*;)/;
const newRegistryEntry = `    ${camelCaseName},`;

if ( registryContent.includes( newRegistryEntry ) ) {
	console.log( `Registry entry for ${camelCaseName} already exists in src/steps-registry.ts` );
} else {
	// Add before the closing brace
	registryContent = registryContent.replace( registryEndRegex, `$1\\n${newRegistryEntry}\\n};` );
	registryContent = registryContent.replace( /(skipWooCommerceWizard,\\s*)\\n\\s*}\\s*;\\n\\s*(\\w+,\\s*)\\n\\s*}\\s*;/, '$1\\n    $2\\n};' );
	console.log( `Added ${camelCaseName} to steps registry` );
}

// Write the updated content back
fs.writeFileSync( registryPath, registryContent );

console.log( '\\nStep created and integrated successfully!' );
console.log( 'Remember to run "npm run build" to rebuild the library' );

// Get the PHP filename from the command line arguments
if (!phpFilename) {
    console.error('Please provide a PHP filename as a parameter.');
    process.exit(1);
}

// Ensure the provided PHP filename exists
if (!fs.existsSync(phpFilename)) {
    console.error('The specified PHP file does not exist.');
    process.exit(1);
}

