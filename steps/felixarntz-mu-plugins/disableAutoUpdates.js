customSteps.disableAutoUpdates = function() {
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
        "path": "wordpress/wp-content/mu-plugins/disable-auto-updates.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Auto Updates\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables all auto updates.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter( 'allow_major_auto_core_updates', '__return_false' );\nadd_filter( 'allow_minor_auto_core_updates', '__return_false' );\nadd_filter( 'allow_dev_auto_core_updates', '__return_false' );\n\nadd_filter( 'auto_update_plugin', '__return_false' );\nadd_filter( 'auto_update_theme', '__return_false' );\nadd_filter( 'auto_update_translation', '__return_false' );\n"
    }
];
    return steps;
}
customSteps.disableAutoUpdates.info = "Disables all auto updates.";
