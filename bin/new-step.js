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
const declarationContent = `import type { StepFunction } from '../types';\n\nexport const ${stepName}: StepFunction;`;
fs.writeFileSync( stepsDir + '/' + stepName + '.d.ts', declarationContent );
console.log( stepsDir + '/' + stepName + '.d.ts created successfully.' );

// Update src/index.ts to include the new step
const indexTsPath = path.join( process.cwd(), 'src', 'index.ts' );
let indexContent = fs.readFileSync( indexTsPath, 'utf8' );

// Add import statement after the last import
const newImport = `import { ${stepName} } from '../steps/${stepName}.js';`;

if ( indexContent.includes( newImport ) ) {
	console.log( `Import for ${stepName} already exists in src/index.ts` );
} else {
	// Find the last import statement and add after it
	const lastImportMatch = indexContent.match( /(import \{[^}]+\} from '[^']+';)(?!\n*import)/g );
	if ( lastImportMatch ) {
		const lastImport = lastImportMatch[lastImportMatch.length - 1];
		const lastImportIndex = indexContent.lastIndexOf( lastImport );
		const insertIndex = lastImportIndex + lastImport.length;
		indexContent = indexContent.slice( 0, insertIndex ) + '\n' + newImport + indexContent.slice( insertIndex );
		console.log( `Added import statement for ${stepName} to src/index.ts` );
	}
}

// Add assignment in loadCustomSteps method
const assignmentRegex = /(this\.customSteps\.enableMultisite = enableMultisite;)/;
const newAssignment = `        this.customSteps.${stepName} = ${stepName};`;

if ( indexContent.includes( newAssignment ) ) {
	console.log( `Assignment for ${stepName} already exists in src/index.ts` );
} else {
	// Add after the last assignment
	indexContent = indexContent.replace( assignmentRegex, `$1\n${newAssignment}` );
	console.log( `Added assignment for ${stepName} to loadCustomSteps() method` );
}

// Write the updated content back
fs.writeFileSync( indexTsPath, indexContent );

console.log( '\nStep created and integrated successfully!' );
console.log( 'Remember to run "npm run build" to rebuild the library' );

// open an editor with this new file by using the $EDITOR env variable
const editor = process.env.VISUAL || process.env.EDITOR || 'vim';
execSync( `${editor} ${stepsDir}/${stepName}.js`, { stdio: 'inherit' } );
