customSteps.bulkEditDeferTermCounting = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/bulk-edit-defer-term-counting.php",
        "data": "<?php\n/**\n * Plugin Name: Bulk Edit Defer Term Counting\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Defers term counting when bulk editing to avoid slow queries for each post updated.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_action(\n\t'load-edit.php',\n\tstatic function () {\n\t\t// phpcs:ignore WordPress.Security.NonceVerification.Recommended\n\t\tif ( isset( $_REQUEST['bulk_edit'] ) ) {\n\t\t\twp_defer_term_counting( true );\n\t\t\tadd_action(\n\t\t\t\t'shutdown',\n\t\t\t\tstatic function () {\n\t\t\t\t\twp_defer_term_counting( false );\n\t\t\t\t}\n\t\t\t);\n\t\t}\n\t}\n);\n"
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
customSteps.bulkEditDeferTermCounting.info = "Defers term counting when bulk editing to avoid slow queries for each post updated.";
