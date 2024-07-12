customSteps.preventCustomMenuOrder = function() {
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
        "path": "wordpress/wp-content/mu-plugins/prevent-custom-menu-order.php",
        "data": "<?php\n/**\n * Plugin Name: Prevent Custom Menu Order\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Forces the custom menu order filter to disabled which tends to be used by plugins to put themselves to the top of the admin menu.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_action(\n\t'admin_menu',\n\tstatic function () {\n\t\tadd_filter( 'custom_menu_order', '__return_false', PHP_INT_MAX );\n\t},\n\tPHP_INT_MAX\n);\n"
    }
];
    return steps;
}
customSteps.preventCustomMenuOrder.info = "Forces the custom menu order filter to disabled which tends to be used by plugins to put themselves to the top of the admin menu.";
