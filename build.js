const fs = require('fs');
const path = require('path');

/**
 * Build script to prepare the npm package
 * This copies the steps directory and ensures all files are in place
 */

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function build() {
    console.log('Building playground-step-library...');

    // Ensure lib directory exists
    if (!fs.existsSync('lib')) {
        fs.mkdirSync('lib');
    }

    // Ensure bin directory exists
    if (!fs.existsSync('bin')) {
        fs.mkdirSync('bin');
    }

    // Create browser-compatible version from the compiled Node.js version
    createBrowserVersion();

    console.log('Build completed successfully!');
}

function createBrowserVersion() {
    console.log('Creating browser-compatible version...');
    
    const nodeJsPath = path.join(__dirname, 'lib', 'index.js');
    const browserPath = path.join(__dirname, 'lib', 'browser.js');
    
    if (!fs.existsSync(nodeJsPath)) {
        console.error('Node.js version not found at:', nodeJsPath);
        return;
    }
    
    let nodeJsCode = fs.readFileSync(nodeJsPath, 'utf8');
    
    // Convert CommonJS to browser-compatible format
    let browserCode = `/**
 * Browser-compatible WordPress Playground Step Library Compiler
 * Generated from src/index.ts - DO NOT EDIT MANUALLY
 */
(function() {
    // Remove Node.js-specific imports and exports
    const fs = null;
    const __dirname = '';
    const path = {
        join: (...parts) => parts.join('/'),
        basename: (p, ext) => {
            const name = p.split('/').pop() || '';
            return ext && name.endsWith(ext) ? name.slice(0, -ext.length) : name;
        }
    };
    
${nodeJsCode
    // Remove the entire TypeScript helper block (everything before the class definition)
    .replace(/^"use strict";[\s\S]*?(?=class PlaygroundStepLibrary)/m, '')
    // Remove Node.js imports
    .replace(/^.*require\(['"][^'"]*['"]\);?$/gm, '')
    .replace(/^.*__importStar.*$/gm, '')
    .replace(/^.*__createBinding.*$/gm, '')
    .replace(/^.*__setModuleDefault.*$/gm, '')
    // Remove CommonJS exports
    .replace(/^module\.exports = .*$/gm, '')
    // Replace the class name and make it global
    .replace(/class PlaygroundStepLibrary/g, 'window.PlaygroundStepLibrary = class')
    // Fix file system operations for browser
    .replace(/fs\.existsSync\([^)]*\)/g, 'false')
    .replace(/fs\.readdirSync\([^)]*\)/g, '[]')
    .replace(/fs\.readFileSync\([^)]*\)/g, '""')
}

    // Override loadCustomSteps to use the global customSteps object
    window.PlaygroundStepLibrary.prototype.loadCustomSteps = function() {
        this.customSteps = window.customSteps || {};
    };

})();`;
    
    fs.writeFileSync(browserPath, browserCode);
    console.log('Browser version created at:', browserPath);
}

if (require.main === module) {
    build();
}

module.exports = { build };