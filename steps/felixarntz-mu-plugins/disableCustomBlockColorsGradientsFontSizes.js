customSteps.disableCustomBlockColorsGradientsFontSizes = function() {
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
        "extractToPath": "/wordpress/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-custom-block-colors-gradients-font-sizes.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Custom Block Colors Gradients Font Sizes\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables custom colors, custom gradients, custom font sizes etc. for the block editor to enforce a uniform style.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter(\n\t'block_editor_settings_all',\n\tstatic function ( $editor_settings ) {\n\t\t$editor_settings['disableCustomColors']       = true;\n\t\t$editor_settings['disableCustomGradients']    = true;\n\t\t$editor_settings['disableCustomFontSizes']    = true;\n\t\t$editor_settings['disableCustomSpacingSizes'] = true;\n\n\t\treturn $editor_settings;\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.disableCustomBlockColorsGradientsFontSizes.info = "Disables custom colors, custom gradients, custom font sizes etc. for the block editor to enforce a uniform style.";
