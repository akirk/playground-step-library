#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import PlaygroundStepLibrary from '../lib/index.js';

function showHelp() {
    console.log(`
WordPress Playground Step Library Compiler

Usage:
  playground-compile [options] <input-blueprint>

Options:
  -o, --output <file>     Output file (default: stdout)
  -s, --steps-dir <dir>   Custom steps directory (default: ./steps)
  -v, --validate          Validate blueprint without compiling
  -l, --list-steps        List available custom steps
  -p, --pretty            Pretty print JSON output
  -h, --help              Show this help

Examples:
  playground-compile blueprint.json
  playground-compile -o compiled.json blueprint.json
  playground-compile --validate blueprint.json
  playground-compile --list-steps
`);
}

function parseArgs(args) {
    const options = {
        input: null,
        output: null,
        stepsDir: null,
        validate: false,
        listSteps: false,
        pretty: false,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '-h':
            case '--help':
                options.help = true;
                break;
            case '-o':
            case '--output':
                options.output = args[++i];
                break;
            case '-s':
            case '--steps-dir':
                options.stepsDir = args[++i];
                break;
            case '-v':
            case '--validate':
                options.validate = true;
                break;
            case '-l':
            case '--list-steps':
                options.listSteps = true;
                break;
            case '-p':
            case '--pretty':
                options.pretty = true;
                break;
            default:
                if (!arg.startsWith('-') && !options.input) {
                    options.input = arg;
                }
                break;
        }
    }

    return options;
}

function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (options.help) {
        showHelp();
        process.exit(0);
    }

    // Initialize compiler
    const compilerOptions = {};
    if (options.stepsDir) {
        compilerOptions.stepsDir = path.resolve(options.stepsDir);
    }

    const compiler = new PlaygroundStepLibrary(compilerOptions);

    // List available steps
    if (options.listSteps) {
        const steps = compiler.getAvailableSteps();
        console.log('Available Custom Steps:\n');
        
        for (const [stepName, stepInfo] of Object.entries(steps)) {
            console.log(`${stepName}${stepInfo.builtin ? ' (builtin)' : ''}`);
            if (stepInfo.description) {
                console.log(`  Description: ${stepInfo.description}`);
            }
            if (stepInfo.vars && stepInfo.vars.length > 0) {
                console.log('  Variables:');
                stepInfo.vars.forEach(v => {
                    const required = v.required ? ' (required)' : '';
                    console.log(`    ${v.name}${required}: ${v.description || 'No description'}`);
                });
            }
            console.log();
        }
        process.exit(0);
    }

    // Validate or compile blueprint
    if (!options.input) {
        console.error('Error: Input blueprint file is required');
        console.error('Use --help for usage information');
        process.exit(1);
    }

    // Read input blueprint
    let blueprint;
    try {
        if (options.input === '-') {
            // Read from stdin
            const stdin = fs.readFileSync(0, 'utf8');
            blueprint = JSON.parse(stdin);
        } else {
            const blueprintPath = path.resolve(options.input);
            if (!fs.existsSync(blueprintPath)) {
                console.error(`Error: Input file does not exist: ${blueprintPath}`);
                process.exit(1);
            }
            const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
            blueprint = JSON.parse(blueprintContent);
        }
    } catch (error) {
        console.error(`Error reading blueprint: ${error.message}`);
        process.exit(1);
    }

    // Validate blueprint
    const validation = compiler.validateBlueprint(blueprint);
    if (!validation.valid) {
        console.error(`Blueprint validation failed: ${validation.error}`);
        process.exit(1);
    }

    if (options.validate) {
        console.log('Blueprint is valid');
        process.exit(0);
    }

    // Compile blueprint
    let compiledBlueprint;
    try {
        compiledBlueprint = compiler.compile(blueprint);
    } catch (error) {
        console.error(`Compilation failed: ${error.message}`);
        process.exit(1);
    }

    // Output result
    const jsonOutput = options.pretty 
        ? JSON.stringify(compiledBlueprint, null, 2)
        : JSON.stringify(compiledBlueprint);

    if (options.output) {
        try {
            fs.writeFileSync(path.resolve(options.output), jsonOutput);
            console.log(`Compiled blueprint written to: ${options.output}`);
        } catch (error) {
            console.error(`Error writing output file: ${error.message}`);
            process.exit(1);
        }
    } else {
        console.log(jsonOutput);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error(`Uncaught error: ${error.message}`);
    process.exit(1);
});

// Check if this is the main module (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}