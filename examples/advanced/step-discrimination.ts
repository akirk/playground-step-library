/**
 * Advanced Example: Custom vs Builtin Step Discrimination
 * Demonstrates how the compiler automatically identifies and handles
 * different step types using TypeScript's discriminated unions
 */

import { runCLI, RunCLIServer } from '@wp-playground/cli';
import PlaygroundStepLibrary from '../../lib/src/index';
import type { StepLibraryBlueprint } from '../../steps/types';

const compiler = new PlaygroundStepLibrary();

const blueprint: StepLibraryBlueprint = {
  steps: [
    // 🔧 Custom installPlugin step (has 'url' property)
    // Will be transformed by our custom function
    {
      step: 'installPlugin',
      url: 'hello-dolly', // Custom signature - triggers transformation
    },

    // 🏗️ Builtin installPlugin step (has 'pluginData' property) 
    // Will pass through unchanged
    {
      step: 'installPlugin',
      pluginData: {
        resource: 'wordpress.org/plugins',
        slug: 'gutenberg'
      },
      options: {
        activate: true
      }
    },

    // 🔧 Custom runPHP step 
    // Will be transformed (though our custom function just passes through)
    {
      step: 'runPHP',
      code: '<?php echo "Custom runPHP step";'
    },

    // 🏗️ Builtin runPHP step (same signature, but will also pass through our transformer)
    {
      step: 'runPHP',
      code: '<?php echo "Builtin runPHP step";'
    },

    // 🔧 Custom-only step (no builtin equivalent)
    // Will always be transformed
    {
      step: 'setSiteName', 
      sitename: 'Step Discrimination Demo',
      tagline: 'Showing how TypeScript discriminates step types'
    },

    // 🏗️ Pure builtin step (no custom equivalent)
    // Will always pass through unchanged  
    {
      step: 'mkdir',
      path: '/wordpress/wp-content/demo-folder'
    }
  ]
};

console.log('🎯 Step Discrimination Demo');
console.log('=' .repeat(50));

console.log('\n📋 Original Blueprint (Mixed Step Types):');
blueprint.steps!.forEach((stepItem, index) => {
  if (!stepItem || typeof stepItem !== 'object') return;
  const step = stepItem as any;
  
  const stepType = 'url' in step ? '🔧 Custom' : 
                   'pluginData' in step ? '🏗️ Builtin' :
                   step.step === 'setSiteName' ? '🔧 Custom-only' :
                   step.step === 'mkdir' ? '🏗️ Builtin-only' :
                   '🔧 Custom';
  
  console.log(`  ${index + 1}. ${stepType}: ${step.step}`);
});

const compiled = compiler.compile(blueprint);

console.log(`\n⚙️ Compilation Results:`);
console.log(`  Input steps:  ${blueprint.steps!.length}`);
console.log(`  Output steps: ${compiled.steps!.length}`);

console.log('\n✨ Compiled Blueprint (All Native Steps):');
compiled.steps!.forEach((stepItem, index) => {
  if (!stepItem || typeof stepItem !== 'object') return;
  const step = stepItem as any;
  console.log(`  ${index + 1}. ${step.step}${step.pluginData ? ` (${step.pluginData.slug})` : ''}`);
});

// Start WordPress Playground
const cliServer: RunCLIServer = await runCLI({
  command: 'server',
  wp: 'latest',
  login: true,
  blueprint: compiled,
});

console.log('\n🚀 WordPress is running with both custom and builtin steps processed correctly!');
console.log('💡 Notice how the compiler automatically:');
console.log('   • Transformed custom installPlugin (url) → native installPlugin (pluginData)');
console.log('   • Passed through builtin installPlugin unchanged');
console.log('   • Handled mixed step types seamlessly');