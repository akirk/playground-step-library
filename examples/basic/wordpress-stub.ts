/**
 * Basic Example: WordPress stub with runPHP
 * This shows how to set up a WordPress environment stub where you can insert your own code
 */

import { runCLI } from '@wp-playground/cli';
import PlaygroundStepLibrary from '../../lib/src/index';
import type { StepLibraryBlueprint } from '../../steps/types';

const compiler = new PlaygroundStepLibrary();

const blueprint: StepLibraryBlueprint = {
  steps: [
    {
      step: 'runPHP',
      code: "<?php require_once 'wordpress/wp-load.php'; // Insert your code here that runs in the scope of WordPress"
    }
  ]
};

console.log('🚀 Running WordPress stub with runPHP...');
console.log('Original blueprint:', JSON.stringify(blueprint, null, 2));

const compiled = compiler.compile(blueprint);
console.log('\n✨ Compiled blueprint:', JSON.stringify(compiled, null, 2));

await runCLI({
  command: 'run-blueprint',
  blueprint: compiled,
});

console.log('\n✅ Blueprint execution complete!');
