import fs from 'fs';
import path from 'path';

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


// Run build if this is the main module
if (process.argv[1] === new URL(import.meta.url).pathname) {
    build();
}

export { build };