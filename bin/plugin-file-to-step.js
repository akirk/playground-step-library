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
const declarationContent = `import type { StepFunction } from '../types';\n\nexport const ${camelCaseName}: StepFunction;`;
fs.writeFileSync(`steps/${camelCaseName}.d.ts`, declarationContent);
console.log(`TypeScript declaration created: steps/${camelCaseName}.d.ts`);

// Update src/index.ts to include the new step
const indexTsPath = path.join( process.cwd(), 'src', 'index.ts' );
let indexContent = fs.readFileSync( indexTsPath, 'utf-8' );

// Add import statement after the last import
const newImport = `import { ${camelCaseName} } from '../steps/${camelCaseName}.js';`;

if ( indexContent.includes( newImport ) ) {
	console.log( `Import for ${camelCaseName} already exists in src/index.ts` );
} else {
	// Find the last import statement and add after it
	const lastImportMatch = indexContent.match( /(import \\{[^}]+\\} from '[^']+';)(?!\\n*import)/g );
	if ( lastImportMatch ) {
		const lastImport = lastImportMatch[lastImportMatch.length - 1];
		const lastImportIndex = indexContent.lastIndexOf( lastImport );
		const insertIndex = lastImportIndex + lastImport.length;
		indexContent = indexContent.slice( 0, insertIndex ) + '\\n' + newImport + indexContent.slice( insertIndex );
		console.log( `Added import statement for ${camelCaseName} to src/index.ts` );
	}
}

// Add assignment in loadCustomSteps method
const assignmentRegex = /(this\\.customSteps\\.enableMultisite = enableMultisite;)/;
const newAssignment = `        this.customSteps.${camelCaseName} = ${camelCaseName};`;

if ( indexContent.includes( newAssignment ) ) {
	console.log( `Assignment for ${camelCaseName} already exists in src/index.ts` );
} else {
	// Add after the last assignment
	indexContent = indexContent.replace( assignmentRegex, `$1\\n${newAssignment}` );
	console.log( `Added assignment for ${camelCaseName} to loadCustomSteps() method` );
}

// Write the updated content back
fs.writeFileSync( indexTsPath, indexContent );

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

