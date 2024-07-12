const fs = require('fs');
const path = require('path');

// chdir into the directory where this script lives
process.chdir( __dirname + '/..' );

// Function to convert a string to camelCase
function toCamelCase(str) {
    return str.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
}

// Function to read all PHP files from the specified directory
function getPHPFiles(dirPath) {
    return fs.readdirSync(dirPath).filter(file => file.endsWith('.php'));
}

// Function to parse the plugin header to get description
function parsePluginDescription(phpContent) {
    const descriptionMatch = phpContent.match(/^[\/*\s]*Description:\s*(.+)\s*\n/im);
    return descriptionMatch ? descriptionMatch[1].trim() : "No description available";
}

// Function to write JS file with steps for each PHP plugin
function writeJSFiles(sourceDir, targetDir, phpFiles) {
    phpFiles.forEach(file => {
        const fileNameWithoutExt = path.basename(file, '.php');
        const camelCaseFileName = toCamelCase(fileNameWithoutExt);
        const phpFilePath = path.join(sourceDir, file);
        const jsFilePath = path.join(targetDir, `${camelCaseFileName}.js`);

        const phpContent = fs.readFileSync(phpFilePath, 'utf8');
        const pluginDescription = parsePluginDescription(phpContent);
        const pluginName = path.basename(fileNameWithoutExt);

        const steps = [
            {
                "step": "mkdir",
                "path": "wordpress/wp-content/mu-plugins",
            },
            {
                "step": "unzip",
                "zipFile": {
	                "resource": "url",
    	            "url": "https://raw.githubusercontent.com/akirk/playground-step-library/main/felixarntz-mu-plugins-shared.zip",
    	        },
	            "extractToPath": "/wordpress/wp-content/mu-plugins",
            },
            {
                "step": "writeFile",
                "path": `wordpress/wp-content/mu-plugins/${pluginName}.php`,
                "data": phpContent.replace(/`/g, '\\`'),
            },
        ];

        const jsFileContent = `customSteps.${camelCaseFileName} = function() {
    var steps = ${JSON.stringify(steps, null, 4)};
    return steps;
}
customSteps.${camelCaseFileName}.info = "${pluginDescription}";
`;

        fs.writeFileSync(jsFilePath, jsFileContent, 'utf8');
        console.log(`Written JS file: ${jsFilePath}`);
    });
}

const sourceDir = 'felixarntz-mu-plugins/felixarntz-mu-plugins';
const targetDir = 'steps/felixarntz-mu-plugins';

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir, { recursive: true });
}

const phpFiles = getPHPFiles(sourceDir);
writeJSFiles(sourceDir, targetDir, phpFiles);

console.log('All files processed successfully.');
