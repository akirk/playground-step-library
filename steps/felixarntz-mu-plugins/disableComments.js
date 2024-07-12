customSteps.disableComments = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-comments.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Comments\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables comments.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\n// Force comment status to closed.\nadd_filter( 'comments_open', '__return_false' );\nadd_filter(\n\t'pre_option_default_comment_status',\n\tstatic function () {\n\t\treturn 'closed';\n\t}\n);\n\n// Hide UI to control comments.\nadd_action(\n\t'init',\n\tstatic function () {\n\t\tremove_action( 'admin_bar_menu', 'wp_admin_bar_comments_menu', 60 );\n\t},\n\tPHP_INT_MAX\n);\nadd_action(\n\t'admin_init',\n\tstatic function () {\n\t\tremove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );\n\t}\n);\nadd_action(\n\t'admin_head',\n\tstatic function () {\n\t\tglobal $pagenow;\n\n\t\tif ( 'options-discussion.php' !== $pagenow ) {\n\t\t\treturn;\n\t\t}\n\n\t\t?>\n<style type=\"text/css\">\n\tlabel[for=\"default_comment_status\"],\n\tlabel[for=\"default_comment_status\"] + br {\n\t\tdisplay: none !important;\n\t}\n</style>\n\t\t<?php\n\t}\n);\n\n// Remove comments menu items and redirect direct access.\nadd_action(\n\t'admin_menu',\n\tstatic function () {\n\t\t$admin_menu = Shared\\Admin_Menu::instance();\n\t\t$admin_menu->remove_menu_page( 'edit-comments.php' );\n\n\t\t// If pingbacks are also disabled, remove the entire Discussion settings page.\n\t\tif ( has_filter( 'pings_open', '__return_false' ) ) {\n\t\t\t$admin_menu->remove_submenu_page( 'options-general.php', 'options-discussion.php' );\n\t\t}\n\t},\n\tPHP_INT_MAX\n);\nadd_action(\n\t'admin_init',\n\tstatic function () {\n\t\tglobal $pagenow;\n\n\t\t$screens_to_redirect = array( 'edit-comments.php' => true );\n\n\t\t// If pingbacks are also disabled, prevent access to the entire Discussion settings page.\n\t\tif ( has_filter( 'pings_open', '__return_false' ) ) {\n\t\t\t$screens_to_redirect['options-discussion.php'] = true;\n\t\t}\n\n\t\tif ( isset( $screens_to_redirect[ $pagenow ] ) ) {\n\t\t\twp_safe_redirect( admin_url() );\n\t\t\texit;\n\t\t}\n\t},\n\t1\n);\n\n\n"
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
customSteps.disableComments.info = "Disables comments.";
