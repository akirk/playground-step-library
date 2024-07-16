const fs = require( 'fs' );
const path = require('path');
const process = require( 'process' );

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
const jsContent = `
customSteps.${camelCaseName} = function() {
	var steps = [
		{
			"step": "mkdir",
			"path": "wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "wordpress/wp-content/mu-plugins/${baseName}.php",
			"data": \`${phpContents}\`
		}
	];
	return steps;
};
`;

// Write the JavaScript content to a file
const jsFilename = `steps/local/${camelCaseName}.js`;
fs.writeFileSync(jsFilename, jsContent);

console.log(`JavaScript file created: ${jsFilename}`);

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

// Update the index.html file with the new step by calling the update-load-steps.js script
require( './update-load-steps' );

