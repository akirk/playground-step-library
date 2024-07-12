customSteps.modifyAllowedBlockTypes = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/modify-allowed-block-types.php",
        "data": "<?php\n/**\n * Plugin Name: Modify Allowed Block Types\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Modifies the block types allowed in the block editor.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_filter(\n\t'allowed_block_types_all',\n\tstatic function ( $block_types, $context ) {\n\t\t$config = Shared\\Config::instance();\n\n\t\t$allowed    = array(\n\t\t\t$config->get( 'allowed_block_types_all', array() ),\n\t\t\t$config->get( \"allowed_block_types_{$context->name}\", array() ),\n\t\t);\n\t\t$disallowed = array(\n\t\t\t$config->get( 'disallowed_block_types_all', array() ),\n\t\t\t$config->get( \"disallowed_block_types_{$context->name}\", array() ),\n\t\t);\n\t\tif ( isset( $context->post->post_type ) ) {\n\t\t\t$allowed[]    = $config->get( \"allowed_block_types_post_type_{$context->post->post_type}\", array() );\n\t\t\t$disallowed[] = $config->get( \"disallowed_block_types_post_type_{$context->post->post_type}\", array() );\n\t\t}\n\t\t$allowed    = array_filter( $allowed );\n\t\t$disallowed = array_filter( $disallowed );\n\n\t\t// Bail without changes if no customizations are provided.\n\t\tif ( ! $allowed && ! $disallowed ) {\n\t\t\treturn $block_types;\n\t\t}\n\n\t\t/*\n\t\t * If any allowlist is provided, initialize the allowed block map empty.\n\t\t * Otherwise, start with a list of all registered block types to then disallow certain block types from there,\n\t\t * unless the original $block_types has already been limited, in which case that should be the starting point.\n\t\t */\n\t\tif ( $allowed ) {\n\t\t\t$block_map = array();\n\t\t} elseif ( is_array( $block_types ) ) {\n\t\t\t$block_map = array_fill_keys( $block_types, true );\n\t\t} else {\n\t\t\t$block_map = array_map(\n\t\t\t\t'__return_true',\n\t\t\t\t\\WP_Block_Type_Registry::get_instance()->get_all_registered()\n\t\t\t);\n\t\t}\n\n\t\t// Amend the initial block map with the configured overrides.\n\t\tforeach ( $allowed as $allowed_blocks ) {\n\t\t\tforeach ( $allowed_blocks as $allowed_block ) {\n\t\t\t\t$block_map[ $allowed_block ] = true;\n\t\t\t}\n\t\t}\n\t\tforeach ( $disallowed as $disallowed_blocks ) {\n\t\t\tforeach ( $disallowed_blocks as $disallowed_block ) {\n\t\t\t\t$block_map[ $disallowed_block ] = false;\n\t\t\t}\n\t\t}\n\n\t\t$block_types = array_keys( array_filter( $block_map ) );\n\n\t\treturn $block_types;\n\t},\n\t10,\n\t2\n);\n"
    },
    {
        "step": "unzip",
        "zipFile": {
            "resource": "url",
            "url": "https://raw.githubusercontent.com/akirk/playground-step-library/main/felixarntz-mu-plugins-shared.zip"
        },
        "extractToPath": "/wordpress/mu-plugins"
    }
];
    return steps;
}
customSteps.modifyAllowedBlockTypes.info = "Modifies the block types allowed in the block editor.";
