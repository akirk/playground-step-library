customSteps.disableDefaultDuotoneGradientsColors = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-default-duotone-gradients-colors.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Default Duotone Gradients Colors\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables the default duotone, default gradients, default colors, etc. for the block editor.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter(\n\t'wp_theme_json_data_default',\n\tstatic function ( $wp_theme_json_data ) {\n\t\t$wp_theme_json_data->update_with(\n\t\t\tarray(\n\t\t\t\t'version'  => \\WP_Theme_JSON::LATEST_SCHEMA,\n\t\t\t\t'settings' => array(\n\t\t\t\t\t'color' => array(\n\t\t\t\t\t\t'defaultDuotone'   => false,\n\t\t\t\t\t\t'defaultGradients' => false,\n\t\t\t\t\t\t'defaultPalette'   => false,\n\t\t\t\t\t),\n\t\t\t\t),\n\t\t\t)\n\t\t);\n\n\t\treturn $wp_theme_json_data;\n\t}\n);\n"
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
customSteps.disableDefaultDuotoneGradientsColors.info = "Disables the default duotone, default gradients, default colors, etc. for the block editor.";
