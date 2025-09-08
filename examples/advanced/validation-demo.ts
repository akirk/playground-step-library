/**
 * Advanced Example: Blueprint Validation Demo
 * Shows validation features without starting WordPress
 * Now demonstrates compile-time type safety with StepLibraryBlueprint
 */

import PlaygroundStepLibrary from '../../lib/src/index';
import type { StepLibraryBlueprint } from '../../steps/types';

const compiler = new PlaygroundStepLibrary();

// Valid blueprint - TypeScript ensures this is correct at compile time
const validBlueprint: StepLibraryBlueprint = {
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

// 🎯 TypeScript now prevents invalid blueprints at compile time!
// These examples would cause TypeScript compilation errors:

/*
// ❌ This would fail TypeScript compilation - missing required 'postType' field
const invalidBlueprint: StepLibraryBlueprint = {
  steps: [
    {
      step: 'addPost',
      postTitle: 'Missing Required Field',
      postContent: 'This post is missing postType'
      // Missing required 'postType' field - TypeScript error!
    }
  ]
};
*/

/*
// ❌ This would fail TypeScript compilation - missing 'steps' array
const malformedBlueprint: StepLibraryBlueprint = {
  invalidProperty: true  // TypeScript error - 'steps' is required!
};
*/

console.log('\n🛡️  TypeScript prevents invalid blueprints at compile time!');
console.log('The above commented examples would cause compilation errors.');

// ✅ Runtime validation is still useful for JSON strings or dynamic data
const jsonString = JSON.stringify({
  steps: [
    {
      step: 'addPost',
      postTitle: 'From JSON',
      postContent: 'This might be missing required fields'
      // Missing 'postType' - will be caught at runtime
    }
  ]
});

console.log('\n📝 Testing runtime validation of JSON string:');
const validation3 = compiler.validateBlueprint(jsonString);
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