/**
 * Basic Example: Create a simple post
 * This shows the most minimal usage of the step library
 * Now with type-safe StepLibraryBlueprint
 */

import { runCLI, RunCLIServer } from '@wp-playground/cli';
import PlaygroundStepLibrary from '../../lib/src/index';
import type { StepLibraryBlueprint } from '../../steps/types';

const compiler = new PlaygroundStepLibrary();

const blueprint: StepLibraryBlueprint = {
  steps: [
    {
      step: 'addPost',
      postTitle: 'Welcome to Playground',
      postContent: '<p>This is a test post created by the blueprint!</p>',
      postType: 'post'
    }
  ]
};

console.log('🚀 Creating a simple post...');
console.log('Original blueprint:', JSON.stringify(blueprint, null, 2));

const compiled = compiler.compile(blueprint);
console.log('\n✨ Compiled blueprint:', JSON.stringify(compiled, null, 2));

// Start WordPress Playground
const cliServer: RunCLIServer = await runCLI({
  command: 'server',
  wp: 'latest',
  login: true,
  blueprint: compiled,
});

console.log('\n🌐 WordPress is running! Check your site for the new post.');