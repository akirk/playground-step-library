/**
 * Basic Site Setup Example
 * Shows how to set up a basic WordPress site with custom steps
 */

import { runCLI, RunCLIServer } from '@wp-playground/cli';
import PlaygroundStepLibrary from '../../lib/index';

const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
    // Configure site basics
    {
      step: 'setSiteName',
      sitename: 'My Custom Site',
      tagline: 'Built with WordPress Playground Step Library'
    },
    // Create an admin user
    {
      step: 'createUser',
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      role: 'administrator'
    },
    // Add an About page
    {
      step: 'addPage',
      postTitle: 'About Us',
      postContent: '<h2>Welcome!</h2><p>This site was created using custom WordPress Playground steps.</p>',
      homepage: false
    }
  ]
};

console.log('🏗️  Setting up a basic WordPress site...');
console.log(`📋 Using ${blueprint.steps.length} custom steps:`);

blueprint.steps.forEach((step, index) => {
  console.log(`  ${index + 1}. ${step.step}`);
});

const compiled = compiler.compile(blueprint);
console.log(`⚙️  Compiled to ${compiled.steps.length} native steps`);

// Start WordPress Playground
const cliServer: RunCLIServer = await runCLI({
  command: 'server',
  wp: 'latest',
  login: true,
  blueprint: compiled,
});

console.log('\n🎉 Site setup complete! Your WordPress site is ready.');