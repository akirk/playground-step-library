/**
 * Advanced Example: Compilation Only Demo
 * Shows the compilation process without starting WordPress
 */

import { createRequire } from 'module';
import PlaygroundStepLibrary from '../../lib/src/index';

const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
    {
      step: 'setSiteName',
      sitename: 'Compilation Demo',
      tagline: 'Showing the transformation process'
    },
    {
      step: 'createUser',
      username: 'testuser',
      password: 'testpass',
      email: 'test@example.com',
      role: 'editor'
    },
    {
      step: 'addPost',
      postTitle: 'Transformed Post',
      postContent: 'This post shows how custom steps become native steps',
      postType: 'post',
      postStatus: 'draft'
    },
    {
      step: 'addPage',
      postTitle: 'Sample Page',
      postContent: '<h2>Compilation Process</h2><p>Custom steps are transformed into runPHP and other native steps.</p>',
      homepage: false
    }
  ]
};

console.log('Original Blueprint with Custom Steps:');
console.log('─'.repeat(50));
console.log(JSON.stringify(blueprint, null, 2));

const compiled = compiler.compile(blueprint);

console.log('\nCompiled Blueprint with Native Steps:');
console.log('─'.repeat(50));
console.log(JSON.stringify(compiled, null, 2));

