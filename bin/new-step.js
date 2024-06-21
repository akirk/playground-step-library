const fs = require('fs');
const process = require('process');

// Specify the directory containing the steps
const stepsDir = "steps";

// chdir into the directory where this script lives
process.chdir(__dirname + '/..');

// Getting the CLI parameter
const stepName = process.argv[2];

// Function to validate the stepName in camelCase format
const isValidCamelCase = (stepName) => {
	if (!stepName[0].match(/[a-z]/)) {
		return false;
	}
	return /^[a-zA-Z0-9_]*$/.test(stepName);
};

// Checking if a stepName was provided and is valid
if (!stepName || !isValidCamelCase(stepName)) {
	console.log('Please provide a valid step name in camelCase.');
	process.exit(1);
}

// Creating the content derived from the name
const content = `customSteps.${stepName} = function( step ) {
	return [
		// Your steps here. Example:
		// {
		// 	"step": "runPHP",
		// 	"code": "<?php require_once 'wordpress/wp-load.php'; error_log( 'Hello \   ${variableName}') ?>"
		// }
	];
};
customSteps.${stepName}.description = "Describe the step here.";
customSteps.${stepName}.vars = [
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
fs.writeFile(stepsDir + '/' + stepName + '.js', content, (err) => {
	if (err) {
		console.error('Error creating file:', err);
		return;
	}
	console.log(`${stepName} created successfully.`);
});

// Update the index.html file with the new step by calling the update-load-steps.js script
require('./update-load-steps');

