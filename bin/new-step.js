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

// Convert stepName to PascalCase for interface name
const pascalCaseStepName = stepName.charAt(0).toUpperCase() + stepName.slice(1);

// Creating the TypeScript content derived from the name
const content = `import type { StepFunction, ${pascalCaseStepName}Step } from './types.js';

export const ${stepName}: StepFunction<${pascalCaseStepName}Step> = (step: ${pascalCaseStepName}Step) => {
	return [
		// Your steps here. Example:
		// {
		// 	"step": "runPHP",
		// 	"code": \`<?php require_once '/wordpress/wp-load.php'; error_log( 'Hello \${step.variableName}' ); ?>\`
		// }
	];
};

${stepName}.description = "Provide useful additional info.";
${stepName}.vars = [
	// Your variables here. Example:
	// {
	// 	name: "variableName",
	// 	description: "Variable description",
	// 	type: "text",
	// 	required: true,
	// 	samples: ["sample1", "sample2"]
	// }
];
`;

// Writing the TypeScript content to a new file
fs.writeFileSync( stepsDir + '/' + stepName + '.ts', content );
console.log( stepsDir + '/' + stepName + '.ts created successfully.' );

// Add the step interface to types.ts
const typesPath = path.join( process.cwd(), stepsDir, 'types.ts' );
let typesContent = fs.readFileSync( typesPath, 'utf8' );

// Create a basic interface template - user can customize
const newInterface = `
export interface ${pascalCaseStepName}Step extends BlueprintStep {
	// Add your step properties here. Example:
	// variableName: string;
}`;

if ( !typesContent.includes( `${pascalCaseStepName}Step` ) ) {
	// Add the interface at the end, before the last newline
	typesContent = typesContent.trimEnd() + newInterface + '\n\n';
	fs.writeFileSync( typesPath, typesContent );
	console.log( `Added ${pascalCaseStepName}Step interface to types.ts` );
} else {
	console.log( `Interface ${pascalCaseStepName}Step already exists in types.ts` );
}

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

// Add to registry object (find the closing brace and add before it)
const registryEntryLine = `    ${stepName},`;

if ( registryContent.includes( registryEntryLine ) ) {
	console.log( `Registry entry for ${stepName} already exists in src/steps-registry.ts` );
} else {
	// Find the closing brace of the stepsRegistry object and add before it
	const registryClosingIndex = registryContent.lastIndexOf( '};' );
	if ( registryClosingIndex !== -1 ) {
		registryContent = registryContent.slice( 0, registryClosingIndex ) + registryEntryLine + '\n};';
		console.log( `Added ${stepName} to steps registry` );
	} else {
		console.error( 'Could not find registry closing brace to add new step' );
	}
}

// Write the updated content back
fs.writeFileSync( registryPath, registryContent );

console.log( '\nStep created and integrated successfully!' );
console.log( 'Remember to run "npm run build" to rebuild the library' );

// open an editor with this new file by using the $EDITOR env variable
const editor = process.env.VISUAL || process.env.EDITOR || 'vim';
execSync( `${editor} ${stepsDir}/${stepName}.ts`, { stdio: 'inherit' } );
