const fs = require('fs');
const path = require('path');

// Specify the directory containing the steps
const stepsDir = "steps";

// chdir into the directory where this script lives
process.chdir(__dirname + '/..');

// Specify the HTML file and the delimiters
const htmlFile = "index.html";
const startDelimiter = "<!-- Start Load Steps -->";
const endDelimiter = "<!-- End Load Steps -->";

// Function to recursively find all JS files in a directory
function getAllJsFiles(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllJsFiles(filePath, filesList);
        } else if (path.extname(file) === '.js') {
            filesList.push(filePath);
        }
    });
    return filesList;
}

// Get a list of all JS files in the specified directory and subdirectories
const jsFiles = getAllJsFiles(stepsDir).map(file => path.relative(stepsDir, file)).sort();

// Construct the sorted script tags for each JS file
const scriptTags = jsFiles.map(jsFile => `\t<script src="${path.join(stepsDir, jsFile)}"></script>`).join('\n');

// Read the contents of the HTML file
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

// Replace everything inside the delimiters with the sorted script tags
const startIndex = htmlContent.indexOf(startDelimiter) + startDelimiter.length;
const endIndex = htmlContent.indexOf(endDelimiter);
const newHtmlContent = htmlContent.substring(0, startIndex) + '\n' + scriptTags + '\n' + htmlContent.substring(endIndex);

// Write the updated HTML content back to the file
fs.writeFileSync(htmlFile, newHtmlContent);
