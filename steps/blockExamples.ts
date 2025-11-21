import type { StepFunction, BlockExamplesStep, StepResult } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';
import { v1ToV2Fallback } from './types.js';

export const blockExamples: StepFunction<BlockExamplesStep> = (step: BlockExamplesStep, blueprint?: any): StepResult => {
	return {
		toV1() {
			const blockNamespace = (step.blockNamespace || '').replace(/'/g, "\\'");
			const postTitle = (step.postTitle || 'Block Examples').replace(/'/g, "\\'");
			const limit = (step.limit !== undefined && step.limit !== null && String(step.limit) !== '') ? Number(step.limit) : 0;
			const postId = (step.postId !== undefined && step.postId !== null && String(step.postId) !== '') ? Number(step.postId) : 1000;
			const excludeCore = step.excludeCore === true || step.excludeCore === 'true';

			const code = `
<?php
require_once '/wordpress/wp-load.php';

$block_namespace = '${blockNamespace}';
$limit = ${limit};
$post_id = ${postId};
$exclude_core = ${excludeCore ? 'true' : 'false'};

$registry = WP_Block_Type_Registry::get_instance();
$registered_blocks = $registry->get_all_registered();

$blocks_data = array();
$blocks_added = 0;

foreach ( $registered_blocks as $block_name => $block_type ) {
	if ( $block_namespace && 0 !== stripos( $block_name, $block_namespace . '/' ) ) {
		continue;
	}

	if ( $exclude_core && 0 === stripos( $block_name, 'core/' ) ) {
		continue;
	}

	$example = null;
	if ( isset( $block_type->example ) ) {
		$example = $block_type->example;
	} elseif ( isset( $block_type->file ) ) {
		$block_json_content = file_get_contents( $block_type->file );
		if ( $block_json_content ) {
			$block_json = json_decode( $block_json_content, true );
			if ( isset( $block_json['example'] ) ) {
				$example = $block_json['example'];
			}
		}
	}

	if ( $example ) {
		$attributes = isset( $example['attributes'] ) ? $example['attributes'] : array();

		$blocks_data[] = array(
			'name' => $block_name,
			'attributes' => $attributes,
			'example' => $example
		);

		$blocks_added++;
		error_log( 'BlockExamples: Adding block: ' . $block_name );

		if ( $limit > 0 && $blocks_added >= $limit ) {
			break;
		}
	}
}

$block_content = '';

if ( ! empty( $blocks_data ) ) {
	foreach ( $blocks_data as $block_data ) {
		$inner_blocks = array();
		if ( isset( $block_data['example']['innerBlocks'] ) && ! empty( $block_data['example']['innerBlocks'] ) ) {
			foreach ( $block_data['example']['innerBlocks'] as $inner_block_data ) {
				if ( isset( $inner_block_data['name'] ) ) {
					$inner_blocks[] = array(
						'blockName' => $inner_block_data['name'],
						'attrs' => isset( $inner_block_data['attributes'] ) ? $inner_block_data['attributes'] : array(),
						'innerBlocks' => array(),
						'innerHTML' => '',
						'innerContent' => array()
					);
				}
			}
		}

		$block_array = array(
			'blockName' => $block_data['name'],
			'attrs' => $block_data['attributes'],
			'innerBlocks' => $inner_blocks,
			'innerHTML' => '',
			'innerContent' => array()
		);

		$serialized = serialize_block( $block_array );
		$block_content .= $serialized . "\n\n";
	}

} else {
	$block_content = 'No blocks found.';
}
wp_insert_post( array(
	'import_id'    => $post_id,
	'post_title'   => '${postTitle}',
	'post_content' => $block_content,
	'post_status'  => 'draft',
	'post_type'    => 'post'
) );
`;

			const caption = blockNamespace
				? `blockExamples: Adding blocks from ${blockNamespace} to ${postTitle}`
				: `blockExamples: Adding blocks to ${postTitle}`;

			const result: BlueprintV1Declaration = {
				steps: [
					{
						"step": "runPHP",
						code,
						"progress": {
							"caption": caption
						}
					}
				]
			};

			if (step.landingPage !== false) {
				result.landingPage = `/wp-admin/post.php?post=${postId}&action=edit`;
			}

			return result;
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

blockExamples.description = "Creates a post with all block examples from registered blocks";
blockExamples.vars = [
	{
		name: "blockNamespace",
		description: "Limit to a specific plugin slug (leave empty for all plugins)",
		type: "text",
		required: false,
		samples: ["", "gutenberg", "woocommerce", "blocktober"],
		deprecated: false
	},
	{
		name: "postTitle",
		description: "Title of the post to create",
		type: "text",
		required: false,
		samples: ["Block Examples", "Plugin Blocks Showcase"],
		deprecated: false
	},
	{
		name: "limit",
		description: "Maximum number of blocks to include (leave empty for no limit)",
		type: "text",
		required: false,
		samples: ["", "10", "20"],
		deprecated: false
	},
	{
		name: "postId",
		description: "Post ID to use (defaults to 1000)",
		type: "text",
		required: false,
		samples: ["1000", "2000", "5000"],
		deprecated: false
	},
	{
		name: "excludeCore",
		description: "Exclude core WordPress blocks",
		type: "boolean",
		required: false,
		samples: ["false", "true"],
		deprecated: false
	},
	{
		name: "landingPage",
		description: "Set landing page to the post editor",
		type: "boolean",
		required: false,
		samples: ["true", "false"],
		deprecated: false
	}
];
