/**
 * CLI Paste Handler
 * Detects content type from stdin or file input and outputs step-library format JSON
 */

import * as fs from 'fs';
import * as path from 'path';

import {
	detectUrlType,
	detectWpAdminUrl,
	detectHtml,
	detectPhp,
	detectPlaygroundUrl,
	detectPlaygroundQueryApiUrl,
	detectBlueprintJson,
	detectStepJson,
	detectStepLibraryRedirectUrl,
	detectCss,
	detectJs,
	detectWpCli,
	normalizeWordPressUrl
} from '../frontend/content-detection';

import {
	parsePlaygroundQueryApi,
	shouldUseMuPlugin
} from '../frontend/playground-integration';

import { BlueprintDecompiler } from '../decompiler';

/**
 * Node.js compatible base64 decoder
 */
function decodeBase64( str: string ): string {
	return Buffer.from( str, 'base64' ).toString( 'utf8' );
}

/**
 * Extract plugin name from PHP code header
 */
function extractPluginName( phpCode: string ): string | null {
	const pluginNameMatch = phpCode.match( /\*\s*Plugin\s+Name:\s*(.+)/i );
	if ( pluginNameMatch ) {
		return pluginNameMatch[1].trim();
	}
	return null;
}

/**
 * Convert plugin name to slug
 */
function nameToSlug( name: string ): string {
	return name.replace( /[^a-z0-9-]/gi, '-' ).toLowerCase();
}

interface StepLibraryOutput {
	steps: Array<{ step: string; vars: Record<string, any> }>;
	preferredVersions?: { wp?: string; php?: string };
	landingPage?: string;
	title?: string;
}

/**
 * Convert a native blueprint to step-library format using the decompiler
 */
function convertBlueprintToStepLibrary( blueprintData: any ): StepLibraryOutput | null {
	if ( !blueprintData ) {
		return null;
	}

	const result: StepLibraryOutput = { steps: [] };

	if ( blueprintData.preferredVersions ) {
		result.preferredVersions = blueprintData.preferredVersions;
	}

	if ( blueprintData.landingPage ) {
		result.landingPage = blueprintData.landingPage;
	}

	// Handle step-library compressed state format (has wpVersion/phpVersion/title at root)
	if ( blueprintData.wpVersion || blueprintData.phpVersion ) {
		result.preferredVersions = result.preferredVersions || {};
		if ( blueprintData.wpVersion ) {
			result.preferredVersions.wp = blueprintData.wpVersion;
		}
		if ( blueprintData.phpVersion ) {
			result.preferredVersions.php = blueprintData.phpVersion;
		}
	}

	if ( blueprintData.title ) {
		result.title = blueprintData.title;
	}

	const blueprintSteps = blueprintData.steps || [];

	// Separate custom steps (already have url) from native steps (need decompiling)
	const customSteps: any[] = [];
	const nativeSteps: any[] = [];

	for ( const step of blueprintSteps ) {
		if ( !step.step ) {
			continue;
		}

		// If step already has vars property (step-library format), it's custom
		if ( 'vars' in step && typeof step.vars === 'object' ) {
			customSteps.push( step );
			continue;
		}

		// installPlugin/installTheme with 'url' property are custom
		if ( ( step.step === 'installPlugin' || step.step === 'installTheme' ) && 'url' in step ) {
			customSteps.push( step );
			continue;
		}

		// Everything else needs decompiling
		nativeSteps.push( step );
	}

	// Add custom steps directly
	for ( const step of customSteps ) {
		if ( 'vars' in step && typeof step.vars === 'object' ) {
			result.steps.push( { step: step.step, vars: step.vars } );
		} else {
			const vars: Record<string, any> = {};
			for ( const key in step ) {
				if ( key !== 'step' ) {
					vars[key] = step[key];
				}
			}
			result.steps.push( { step: step.step, vars } );
		}
	}

	// Decompile native steps
	if ( nativeSteps.length > 0 ) {
		const decompiler = new BlueprintDecompiler();
		const decompiled = decompiler.decompile( { ...blueprintData, steps: nativeSteps } );

		for ( const step of decompiled.steps ) {
			if ( 'vars' in step && typeof step.vars === 'object' ) {
				result.steps.push( { step: step.step, vars: step.vars as Record<string, any> } );
			} else {
				const vars: Record<string, any> = {};
				for ( const key in step ) {
					if ( key !== 'step' ) {
						vars[key] = (step as any)[key];
					}
				}
				result.steps.push( { step: step.step, vars } );
			}
		}
	}

	return result;
}

/**
 * Detect the content type and return its name
 */
function detectContentType( text: string ): string | null {
	const lines = text.split( '\n' ).map( line => line.trim() ).filter( line => line );

	for ( const line of lines ) {
		if ( detectPlaygroundUrl( line, decodeBase64 ) ) {
			return 'playgroundUrl';
		}
		if ( detectPlaygroundQueryApiUrl( line ) ) {
			return 'playgroundQueryApi';
		}
		if ( detectStepLibraryRedirectUrl( line ) ) {
			return 'stepLibraryRedirect';
		}
		if ( detectWpAdminUrl( line ) ) {
			return 'wpAdminUrl';
		}
		if ( detectUrlType( line ) ) {
			return 'url';
		}
	}

	if ( detectBlueprintJson( text ) ) {
		return 'blueprintJson';
	}
	if ( detectStepJson( text ) ) {
		return 'stepJson';
	}
	if ( detectPhp( text ) ) {
		return 'php';
	}
	if ( detectHtml( text ) ) {
		return 'html';
	}
	if ( detectWpCli( text ) ) {
		return 'wpCli';
	}
	if ( detectCss( text ) ) {
		return 'css';
	}
	if ( detectJs( text ) ) {
		return 'js';
	}

	return null;
}

/**
 * Process pasted content and return step-library format
 */
function processPaste( text: string ): StepLibraryOutput | null {
	if ( !text || typeof text !== 'string' ) {
		return null;
	}

	const lines = text.split( '\n' ).map( line => line.trim() ).filter( line => line );
	const steps: Array<{ step: string; vars: Record<string, any> }> = [];

	// Check URL-based content types first
	for ( const line of lines ) {
		const playgroundBlueprint = detectPlaygroundUrl( line, decodeBase64 );
		if ( playgroundBlueprint ) {
			return convertBlueprintToStepLibrary( playgroundBlueprint );
		}

		if ( detectPlaygroundQueryApiUrl( line ) ) {
			const blueprint = parsePlaygroundQueryApi( line );
			if ( blueprint ) {
				return convertBlueprintToStepLibrary( blueprint );
			}
		}

		const stepLibrarySteps = detectStepLibraryRedirectUrl( line );
		if ( stepLibrarySteps ) {
			return { steps: stepLibrarySteps };
		}

		const wpAdminPath = detectWpAdminUrl( line );
		if ( wpAdminPath ) {
			return {
				steps: [{ step: 'setLandingPage', vars: { landingPage: wpAdminPath } }]
			};
		}

		const urlType = detectUrlType( line );
		if ( urlType ) {
			const normalizedUrl = normalizeWordPressUrl( line, urlType );
			const stepType = urlType === 'theme' ? 'installTheme' : 'installPlugin';
			steps.push( { step: stepType, vars: { url: normalizedUrl } } );
		}
	}

	if ( steps.length > 0 ) {
		return { steps };
	}

	// Check text-based content types
	const blueprintData = detectBlueprintJson( text );
	if ( blueprintData ) {
		return convertBlueprintToStepLibrary( blueprintData );
	}

	const stepData = detectStepJson( text );
	if ( stepData ) {
		return convertBlueprintToStepLibrary( { steps: [stepData] } );
	}

	if ( detectPhp( text ) ) {
		const useMuPlugin = shouldUseMuPlugin( text );
		const stepType = useMuPlugin ? 'muPlugin' : 'runPHP';
		const vars: Record<string, any> = { code: text };

		if ( useMuPlugin ) {
			const pluginName = extractPluginName( text );
			vars.name = pluginName ? nameToSlug( pluginName ) : 'pasted-plugin';
		}

		return { steps: [{ step: stepType, vars }] };
	}

	if ( detectHtml( text ) ) {
		return {
			steps: [{
				step: 'addPost',
				vars: {
					title: 'Pasted Content',
					content: text,
					type: 'page'
				}
			}]
		};
	}

	const wpCliCommands = detectWpCli( text );
	if ( wpCliCommands ) {
		const cliSteps = wpCliCommands.map( command => ( {
			step: 'runWpCliCommand',
			vars: { command }
		} ) );
		return { steps: cliSteps };
	}

	if ( detectCss( text ) ) {
		return {
			steps: [{
				step: 'enqueueCss',
				vars: {
					css: text,
					filename: 'pasted-styles'
				}
			}]
		};
	}

	if ( detectJs( text ) ) {
		return {
			steps: [{
				step: 'enqueueJs',
				vars: {
					js: text,
					filename: 'pasted-script'
				}
			}]
		};
	}

	return null;
}

function showHelp(): void {
	console.log( `
Step Library Import CLI

Detects content type from input and imports to step-library format JSON.

Usage:
  step-library-import [options] [input-file]
  echo "content" | step-library-import

Options:
  -o, --output <file>     Output file (default: stdout)
  -p, --pretty            Pretty print JSON output
  -t, --type              Show detected content type only
  -h, --help              Show this help

Supported Content Types:
  - WordPress Playground URLs (with blueprint hash, URL-encoded or base64)
  - Playground Query API URLs
  - Step Library redirect URLs (with step[] query params)
  - Blueprint JSON
  - Step JSON
  - PHP code (creates runPHP or muPlugin step)
  - HTML content (creates addPost step)
  - WP-CLI commands (creates runWpCliCommand steps)
  - CSS code (creates enqueueCss step)
  - JavaScript code (creates enqueueJs step)
  - Plugin/Theme URLs (creates installPlugin/installTheme steps)
  - WordPress admin URLs (creates setLandingPage step)

Examples:
  echo "<?php echo 'Hello';" | step-library-import -p
  echo "https://wordpress.org/plugins/akismet/" | step-library-import
  echo "wp plugin activate akismet" | step-library-import
  step-library-import blueprint.json -o steps.json
` );
}

interface CliOptions {
	input: string | null;
	output: string | null;
	pretty: boolean;
	typeOnly: boolean;
	help: boolean;
}

function parseArgs( args: string[] ): CliOptions {
	const options: CliOptions = {
		input: null,
		output: null,
		pretty: false,
		typeOnly: false,
		help: false
	};

	for ( let i = 0; i < args.length; i++ ) {
		const arg = args[i];

		switch ( arg ) {
			case '-h':
			case '--help':
				options.help = true;
				break;
			case '-o':
			case '--output':
				options.output = args[++i];
				break;
			case '-p':
			case '--pretty':
				options.pretty = true;
				break;
			case '-t':
			case '--type':
				options.typeOnly = true;
				break;
			default:
				if ( !arg.startsWith( '-' ) && !options.input ) {
					options.input = arg;
				}
				break;
		}
	}

	return options;
}

async function main(): Promise<void> {
	const args = process.argv.slice( 2 );
	const options = parseArgs( args );

	if ( options.help ) {
		showHelp();
		process.exit( 0 );
	}

	let input: string;
	try {
		if ( options.input ) {
			if ( options.input === '-' ) {
				input = fs.readFileSync( 0, 'utf8' );
			} else {
				const inputPath = path.resolve( options.input );
				if ( !fs.existsSync( inputPath ) ) {
					console.error( `Error: Input file does not exist: ${inputPath}` );
					process.exit( 1 );
				}
				input = fs.readFileSync( inputPath, 'utf8' );
			}
		} else {
			if ( process.stdin.isTTY ) {
				console.error( 'Error: No input provided. Use --help for usage information.' );
				process.exit( 1 );
			}
			input = fs.readFileSync( 0, 'utf8' );
		}
	} catch ( error: any ) {
		console.error( `Error reading input: ${error.message}` );
		process.exit( 1 );
	}

	if ( !input || !input.trim() ) {
		console.error( 'Error: Empty input' );
		process.exit( 1 );
	}

	if ( options.typeOnly ) {
		const contentType = detectContentType( input );
		if ( contentType ) {
			console.log( contentType );
		} else {
			console.error( 'Unable to detect content type' );
			process.exit( 1 );
		}
		process.exit( 0 );
	}

	const result = processPaste( input );

	if ( !result ) {
		console.error( 'Unable to detect content type or process input' );
		process.exit( 1 );
	}

	const jsonOutput = options.pretty
		? JSON.stringify( result, null, 2 )
		: JSON.stringify( result );

	if ( options.output ) {
		try {
			fs.writeFileSync( path.resolve( options.output ), jsonOutput );
			console.error( `Output written to: ${options.output}` );
		} catch ( error: any ) {
			console.error( `Error writing output file: ${error.message}` );
			process.exit( 1 );
		}
	} else {
		console.log( jsonOutput );
	}
}

process.on( 'uncaughtException', ( error ) => {
	console.error( `Uncaught error: ${error.message}` );
	process.exit( 1 );
} );

main();
