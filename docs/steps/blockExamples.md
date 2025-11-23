# `blockExamples` Step

Creates a post with all block examples from registered blocks

**[View Source](../../steps/blockExamples.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `blockNamespace` | text | ❌ No | Limit to a specific plugin slug (leave empty for all plugins) |
| `postTitle` | text | ❌ No | Title of the post to create |
| `limit` | text | ❌ No | Maximum number of blocks to include (leave empty for no limit) |
| `postId` | text | ❌ No | Post ID to use (defaults to 1000) |
| `excludeCore` | boolean | ❌ No | Exclude core WordPress blocks |
| `landingPage` | boolean | ❌ No | Set landing page to the post editor |


## Examples

### Basic Usage
```json
    {
          "step": "blockExamples"
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "landingPage": "/wp-admin/post.php?post=1000&action=edit",
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php\nrequire_once '/wordpress/wp-load.php';\n$block_namespace = '';\n$limit ...",
      "progress": {
        "caption": "blockExamples: Adding blocks to Block Examples"
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "\n<?php\nrequire_once '/wordpress/wp-load.php';\n\n$block_namespace = '';\n$limit = 0;\n$post_id = 1000;\n$exclude_core = false;\n\n$registry = WP_Block_Type_Registry::get_instance();\n$registered_blocks = $registry->get_all_registered();\n\n$blocks_data = array();\n$blocks_added = 0;\n\nforeach ( $registered_blocks as $block_name => $block_type ) {\n\tif ( $block_namespace && 0 !== stripos( $block_name, $block_namespace . '/' ) ) {\n\t\tcontinue;\n\t}\n\n\tif ( $exclude_core && 0 === stripos( $block_name, 'core/' ) ) {\n\t\tcontinue;\n\t}\n\n\t$example = null;\n\tif ( isset( $block_type->example ) ) {\n\t\t$example = $block_type->example;\n\t} elseif ( isset( $block_type->file ) ) {\n\t\t$block_json_content = file_get_contents( $block_type->file );\n\t\tif ( $block_json_content ) {\n\t\t\t$block_json = json_decode( $block_json_content, true );\n\t\t\tif ( isset( $block_json['example'] ) ) {\n\t\t\t\t$example = $block_json['example'];\n\t\t\t}\n\t\t}\n\t}\n\n\tif ( $example ) {\n\t\t$attributes = isset( $example['attributes'] ) ? $example['attributes'] : array();\n\n\t\t$blocks_data[] = array(\n\t\t\t'name' => $block_name,\n\t\t\t'attributes' => $attributes,\n\t\t\t'example' => $example\n\t\t);\n\n\t\t$blocks_added++;\n\t\terror_log( 'BlockExamples: Adding block: ' . $block_name );\n\n\t\tif ( $limit > 0 && $blocks_added >= $limit ) {\n\t\t\tbreak;\n\t\t}\n\t}\n}\n\n$block_content = '';\n\nif ( ! empty( $blocks_data ) ) {\n\tforeach ( $blocks_data as $block_data ) {\n\t\t$inner_blocks = array();\n\t\tif ( isset( $block_data['example']['innerBlocks'] ) && ! empty( $block_data['example']['innerBlocks'] ) ) {\n\t\t\tforeach ( $block_data['example']['innerBlocks'] as $inner_block_data ) {\n\t\t\t\tif ( isset( $inner_block_data['name'] ) ) {\n\t\t\t\t\t$inner_blocks[] = array(\n\t\t\t\t\t\t'blockName' => $inner_block_data['name'],\n\t\t\t\t\t\t'attrs' => isset( $inner_block_data['attributes'] ) ? $inner_block_data['attributes'] : array(),\n\t\t\t\t\t\t'innerBlocks' => array(),\n\t\t\t\t\t\t'innerHTML' => '',\n\t\t\t\t\t\t'innerContent' => array()\n\t\t\t\t\t);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\t$block_array = array(\n\t\t\t'blockName' => $block_data['name'],\n\t\t\t'attrs' => $block_data['attributes'],\n\t\t\t'innerBlocks' => $inner_blocks,\n\t\t\t'innerHTML' => '',\n\t\t\t'innerContent' => array()\n\t\t);\n\n\t\t$serialized = serialize_block( $block_array );\n\t\t$block_content .= $serialized . \"\n\n\";\n\t}\n\n} else {\n\t$block_content = 'No blocks found.';\n}\nwp_insert_post( array(\n\t'import_id'    => $post_id,\n\t'post_title'   => 'Block Examples',\n\t'post_content' => $block_content,\n\t'post_status'  => 'draft',\n\t'post_type'    => 'post'\n) );\n"
      },
      "progress": {
        "caption": "blockExamples: Adding blocks to Block Examples"
      }
    }
  ],
  "applicationOptions": {
    "wordpress-playground": {
      "landingPage": "/wp-admin/post.php?post=1000&action=edit"
    }
  }
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "blockExamples",
          "vars": {
                "blockNamespace": "gutenberg",
                "postTitle": "Block Examples",
                "limit": "10",
                "postId": "1000",
                "excludeCore": false,
                "landingPage": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

