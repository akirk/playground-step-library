/**
 * Build CLI tools using esbuild
 * Bundles TypeScript CLI scripts into standalone JS files
 */

import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath( new URL( '.', import.meta.url ) );
const projectRoot = resolve( __dirname, '..' );

async function buildCli() {
	console.log( 'Building CLI tools...' );

	await build( {
		configFile: false,
		publicDir: false,
		build: {
			lib: {
				entry: resolve( projectRoot, 'src/cli/paste.ts' ),
				formats: ['es'],
				fileName: () => 'paste.js'
			},
			outDir: 'bin',
			emptyOutDir: false,
			rollupOptions: {
				external: ['fs', 'path', 'node:fs', 'node:path'],
				output: {
					banner: '#!/usr/bin/env node'
				}
			},
			minify: false,
			sourcemap: false
		},
		logLevel: 'warn'
	} );

	console.log( 'CLI tools built successfully!' );
}

buildCli().catch( err => {
	console.error( 'Failed to build CLI:', err );
	process.exit( 1 );
} );
