import type { StepFunction, BlockExamplesStep } from './types.js';

export const blockExamples: StepFunction<BlockExamplesStep> = (step: BlockExamplesStep, blueprint?: any) => {
	const pluginSlug = (step.pluginSlug || '').replace(/'/g, "\\'");
	const postTitle = (step.postTitle || 'Block Examples').replace(/'/g, "\\'");
	const limit = (step.limit !== undefined && step.limit !== null && String(step.limit) !== '') ? Number(step.limit) : 0;
	const postId = (step.postId !== undefined && step.postId !== null && String(step.postId) !== '') ? Number(step.postId) : 1000;

	const code = `
<?php
require_once '/wordpress/wp-load.php';

$plugin_slug = '${pluginSlug}';
$limit = ${limit};
$post_id = ${postId};

try {
	$registry = WP_Block_Type_Registry::get_instance();
	$registered_blocks = $registry->get_all_registered();


	$blocks_data = array();
	$blocks_added = 0;

	foreach ( $registered_blocks as $block_name => $block_type ) {
		if ( ! empty( $plugin_slug ) ) {
			$block_json_file = null;
			if ( isset( $block_type->file ) ) {
				$block_json_file = $block_type->file;
			}

			if ( $block_json_file ) {
				if ( strpos( $block_json_file, '/plugins/' . $plugin_slug . '/' ) === false ) {
					continue;
				}
			} else {
				continue;
			}
		} else {
			if ( strpos( $block_name, 'core/' ) === 0 ) {
				continue;
			}
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


	if ( ! empty( $blocks_data ) ) {
		$block_content = '';

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


		$created_post_id = wp_insert_post( array(
			'import_id'    => $post_id,
			'post_title'   => '${postTitle}',
			'post_content' => $block_content,
			'post_status'  => 'draft',
			'post_type'    => 'post'
		) );

		if ( is_wp_error( $created_post_id ) ) {
			throw new Exception( 'Failed to create post: ' . $created_post_id->get_error_message() );
		} else {
			$edit_url = admin_url( 'post.php?post=' . $created_post_id . '&action=edit' );
		}
	} else {
		throw new Exception( 'No blocks found to create post' );
	}
} catch ( Exception $e ) {
	throw $e;
}
`;

	const caption = pluginSlug
		? `blockExamples: ${pluginSlug}`
		: `blockExamples`;

	const result = [
		{
			"step": "runPHP",
			code,
			"progress": {
				"caption": caption
			}
		}
	] as any;

	if (step.landingPage !== false) {
		result.landingPage = `/wp-admin/post.php?post=${postId}&action=edit`;
	}

	return result;
};

blockExamples.description = "Creates a post with all block examples from registered blocks";
blockExamples.vars = Object.entries({
	pluginSlug: {
		description: "Limit to a specific plugin slug (leave empty for all plugins)",
		type: "text",
		required: false,
		samples: ["", "gutenberg", "woocommerce", "blocktober"],
		deprecated: false
	},
	postTitle: {
		description: "Title of the post to create",
		type: "text",
		required: false,
		samples: ["Block Examples", "Plugin Blocks Showcase"],
		deprecated: false
	},
	limit: {
		description: "Maximum number of blocks to include (leave empty for no limit)",
		type: "text",
		required: false,
		samples: ["", "10", "20"],
		deprecated: false
	},
	postId: {
		description: "Post ID to use (defaults to 1000)",
		type: "text",
		required: false,
		samples: ["1000", "2000", "5000"],
		deprecated: false
	},
	landingPage: {
		description: "Set landing page to the post editor (set to false to disable)",
		type: "text",
		required: false,
		samples: ["true", "false"],
		deprecated: false
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));
