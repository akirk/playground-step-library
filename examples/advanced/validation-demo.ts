/**
 * Advanced Example: Blueprint Validation Demo
 * Shows validation features without starting WordPress
 */

import { createRequire } from 'module';
import PlaygroundStepLibrary from '../../lib/index';

const compiler = new PlaygroundStepLibrary();

// Valid blueprint
const validBlueprint = {
  steps: [
    {
      step: 'setSiteName',
      sitename: 'Valid Site',
      tagline: 'This blueprint is valid'
    },
    {
      step: 'addPost',
      postTitle: 'Valid Post',
      postContent: 'This post has all required fields',
      postType: 'post'
    }
  ]
};

console.log('✅ Testing VALID blueprint:');
const validation1 = compiler.validateBlueprint(validBlueprint);
console.log(`Result: ${validation1.valid ? 'PASSED' : 'FAILED'}`);
if (!validation1.valid) {
  console.log(`Error: ${validation1.error}`);
}

// Invalid blueprint - missing required field
const invalidBlueprint = {
  steps: [
    {
      step: 'addPost',
      postTitle: 'Missing Required Field',
      postContent: 'This post is missing postType'
      // Missing required 'postType' field
    }
  ]
};

console.log('\n❌ Testing INVALID blueprint (missing required field):');
const validation2 = compiler.validateBlueprint(invalidBlueprint);
console.log(`Result: ${validation2.valid ? 'PASSED' : 'FAILED'}`);
if (!validation2.valid) {
  console.log(`Error: ${validation2.error}`);
}

// Invalid blueprint - malformed structure
const malformedBlueprint = {
  // Missing 'steps' array
  invalidProperty: true
};

console.log('\n❌ Testing MALFORMED blueprint (missing steps array):');
const validation3 = compiler.validateBlueprint(malformedBlueprint);
console.log(`Result: ${validation3.valid ? 'PASSED' : 'FAILED'}`);
if (!validation3.valid) {
  console.log(`Error: ${validation3.error}`);
}

// Show available steps
console.log('\n📋 Available Custom Steps:');
const availableSteps = compiler.getAvailableSteps();
const customSteps = Object.entries(availableSteps)
  .filter(([name, info]) => !info.builtin)

customSteps.forEach(([name, info]) => {
  console.log(`  • ${name}: ${info.description || 'No description'}`);
});

console.log(`\n📊 Total: ${Object.keys(availableSteps).length} steps available`);
console.log('\n🎯 Validation demo complete!');