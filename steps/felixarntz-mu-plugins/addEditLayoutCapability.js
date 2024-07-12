customSteps.addEditLayoutCapability = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "unzip",
        "zipFile": {
            "resource": "url",
            "url": "https://raw.githubusercontent.com/akirk/playground-step-library/main/felixarntz-mu-plugins-shared.zip"
        },
        "extractToPath": "/wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/add-edit-layout-capability.php",
        "data": "<?php\n/**\n * Plugin Name: Add Edit Layout Capability\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Adds a dedicated capability for editing layout in the block editor.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\n// Grant the 'edit_layout' capability to everyone that can 'edit_theme_options'.\nadd_filter(\n\t'user_has_cap',\n\tstatic function ( $allcaps ) {\n\t\tif ( isset( $allcaps['edit_theme_options'] ) ) {\n\t\t\t$allcaps['edit_layout'] = $allcaps['edit_theme_options'];\n\t\t}\n\t\treturn $allcaps;\n\t}\n);\n\n// Disallow editing layout in the block editor unless the current user can 'edit_layout'.\nadd_filter(\n\t'wp_theme_json_data_default',\n\tstatic function ( $wp_theme_json_data ) {\n\t\t// Bail if the current user can edit the layout.\n\t\tif ( current_user_can( 'edit_layout' ) ) {\n\t\t\treturn $wp_theme_json_data;\n\t\t}\n\n\t\t// This only works in WordPress 6.4+.\n\t\t$wp_theme_json_data->update_with(\n\t\t\tarray(\n\t\t\t\t'version'  => \\WP_Theme_JSON::LATEST_SCHEMA,\n\t\t\t\t'settings' => array(\n\t\t\t\t\t'layout' => array(\n\t\t\t\t\t\t'allowEditing' => false,\n\t\t\t\t\t),\n\t\t\t\t),\n\t\t\t)\n\t\t);\n\n\t\treturn $wp_theme_json_data;\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.addEditLayoutCapability.info = "Adds a dedicated capability for editing layout in the block editor.";
