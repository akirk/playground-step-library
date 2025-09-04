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

    console.log('Build completed successfully!');
}

if (require.main === module) {
    build();
}

module.exports = { build };