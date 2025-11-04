/**
 * Basic Example: Run PHP code in WordPress context
 * This shows how to execute PHP code within WordPress Playground
 */

import { runCLI, RunCLIServer } from '@wp-playground/cli';
import PlaygroundStepLibrary from '../../lib/src/index';
import type { StepLibraryBlueprint } from '../../steps/types';

const compiler = new PlaygroundStepLibrary();

const blueprint: StepLibraryBlueprint = {
  steps: [
    {
      step: 'runPHP',
      code: "<?php echo 'Hello from WordPress Playground!';"
    },
    {
      step: 'runPHP',
      code: "<?php require_once '/wordpress/wp-load.php'; $post_id = wp_insert_post( array( 'post_title' => 'Created via PHP', 'post_content' => 'This post was created using runPHP step', 'post_status' => 'publish' ) ); echo 'Created post ID: ' . $post_id;"
    }
  ]
};

console.log('🚀 Running PHP code in WordPress Playground...');
console.log('Original blueprint:', JSON.stringify(blueprint, null, 2));

const compiled = compiler.compile(blueprint);
console.log('\n✨ Compiled blueprint:', JSON.stringify(compiled, null, 2));

const playground: RunCLIServer = await runCLI({
  command: 'server',
  wp: 'latest',
  blueprint: compiled,
});

console.log('\n✅ Blueprint execution complete!');

console.log('\n🔍 Verifying the output by running PHP directly...');
const result = await playground.playground.run({
  code: "<?php require_once '/wordpress/wp-load.php'; $posts = get_posts( array( 'post_type' => 'post', 'numberposts' => 1 ) ); if ( !empty( $posts ) ) { echo 'Found post: ' . $posts[0]->post_title . ' (ID: ' . $posts[0]->ID . ')'; } else { echo 'No posts found'; }"
});

console.log('Output:', result.text);

// Clean up and shut down the WordPress Playground server
await playground[Symbol.asyncDispose]();
