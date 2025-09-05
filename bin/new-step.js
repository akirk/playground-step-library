import fs from 'fs';
import path from 'path';
import process from 'process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Specify the directory containing the steps
const stepsDir = "steps";

// chdir into the directory where this script lives
process.chdir( __dirname + '/..' );

// Getting the CLI parameter
const stepName = process.argv[2];

// Function to validate the stepName in camelCase format
const isValidCamelCase = ( stepName ) => {
	if ( !stepName[0].match( /[a-z]/ ) ) {
		return false;
	}
	return /^[a-zA-Z0-9_]*$/.test( stepName );
};

// Checking if a stepName was provided and is valid
if ( !stepName || !isValidCamelCase( stepName ) ) {
	console.log( 'Please provide a valid step name in camelCase.' );
	process.exit( 1 );
}

// Creating the content derived from the name
const content = `export function ${stepName}( step ) {
	return [
		// Your steps here. Example:
		// {
		// 	"step": "runPHP",
		// 	"code": "<?php require_once '/wordpress/wp-load.php'; error_log( 'Hello \${variableName}' ) ?>"
		// }
	];
}

${stepName}.description = "Provide useful additional info.";
${stepName}.vars = [
	// Your variables here. Example:
	// {
	// 	"name": "variableName",
	// 	"description": "Variable description",
	// 	"type": "boolean",
	// 	"required": true,
	// 	"samples": [ "sample1", "sample2" ]
	// }
];
`;

// Writing the content to a new file
fs.writeFileSync( stepsDir + '/' + stepName + '.js', content );
console.log( stepsDir + '/' + stepName + '.js created successfully.' );

// Create TypeScript declaration file
const declarationContent = `import type { StepFunction } from '../types.js';\n\nexport const ${stepName}: StepFunction;\n`;
fs.writeFileSync( stepsDir + '/' + stepName + '.d.ts', declarationContent );
console.log( stepsDir + '/' + stepName + '.d.ts created successfully.' );

// Update src/steps-registry.ts to include the new step
const registryPath = path.join( process.cwd(), 'src', 'steps-registry.ts' );
let registryContent = fs.readFileSync( registryPath, 'utf8' );

// Add import statement after the last import
const newImport = `import { ${stepName} } from '../steps/${stepName}.js';`;

if ( registryContent.includes( newImport ) ) {
	console.log( `Import for ${stepName} already exists in src/steps-registry.ts` );
} else {
	// Find the last import statement and add after it
	const lastImportMatch = registryContent.match( /(import \{[^}]+\} from '[^']+';)(?!\n*import)/g );
	if ( lastImportMatch ) {
		const lastImport = lastImportMatch[lastImportMatch.length - 1];
		const lastImportIndex = registryContent.lastIndexOf( lastImport );
		const insertIndex = lastImportIndex + lastImport.length;
		registryContent = registryContent.slice( 0, insertIndex ) + '\n' + newImport + registryContent.slice( insertIndex );
		console.log( `Added import statement for ${stepName} to src/steps-registry.ts` );
	}
}

// Add to registry object
const registryEndRegex = /(skipWooCommerceWizard,\s*\n\s*}\s*;)/;
const newRegistryEntry = `    ${stepName},`;

if ( registryContent.includes( newRegistryEntry ) ) {
	console.log( `Registry entry for ${stepName} already exists in src/steps-registry.ts` );
} else {
	// Add before the closing brace
	registryContent = registryContent.replace( registryEndRegex, `$1\n${newRegistryEntry}\n};` );
	registryContent = registryContent.replace( /(skipWooCommerceWizard,\s*)\n\s*}\s*;\n\s*(\w+,\s*)\n\s*}\s*;/, '$1\n    $2\n};' );
	console.log( `Added ${stepName} to steps registry` );
}

// Write the updated content back
fs.writeFileSync( registryPath, registryContent );

console.log( '\nStep created and integrated successfully!' );
console.log( 'Remember to run "npm run build" to rebuild the library' );

// open an editor with this new file by using the $EDITOR env variable
const editor = process.env.VISUAL || process.env.EDITOR || 'vim';
execSync( `${editor} ${stepsDir}/${stepName}.js`, { stdio: 'inherit' } );
