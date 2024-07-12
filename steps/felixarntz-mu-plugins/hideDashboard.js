customSteps.hideDashboard = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins",
        "dedup": true
    },
    {
        "step": "unzip",
        "zipFile": {
            "resource": "url",
            "url": "https://raw.githubusercontent.com/akirk/playground-step-library/main/felixarntz-mu-plugins-shared.zip"
        },
        "extractToPath": "/wordpress/wp-content/mu-plugins",
        "dedup": true
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins/hide-dashboard.php",
        "data": "<?php\n/**\n * Plugin Name: Hide Dashboard\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Hides the WordPress dashboard if no additional submenu pages are added to it.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\n// Hide the dashboard menu if it only contains the default WordPress submenu items.\nadd_action(\n\t'admin_menu',\n\tstatic function () {\n\t\tglobal $menu;\n\n\t\t$admin_menu = Shared\\Admin_Menu::instance();\n\t\tif ( $admin_menu->get_menu_page( 'index.php' ) ) {\n\t\t\t$submenu_page_count = $admin_menu->get_submenu_page_count( 'index.php' );\n\n\t\t\t// Migrate the other WordPress submenu items to options pages.\n\t\t\tif ( 2 === $submenu_page_count ) {\n\t\t\t\t$extra_submenu_page = $admin_menu->get_submenu_page( 'index.php', 'update-core.php' );\n\t\t\t\tif ( ! $extra_submenu_page ) {\n\t\t\t\t\t$extra_submenu_page = $admin_menu->get_submenu_page( 'index.php', 'my-sites.php' );\n\t\t\t\t}\n\t\t\t\tif ( $extra_submenu_page ) {\n\t\t\t\t\tif ( ! $admin_menu->move_submenu_page( 'index.php', $extra_submenu_page[2], 'options-general.php', 12 ) ) {\n\t\t\t\t\t\treturn;\n\t\t\t\t\t}\n\t\t\t\t\t$submenu_page_count--;\n\t\t\t\t\tif ( $admin_menu->get_submenu_page_count( 'options-general.php' ) === 1 ) {\n\t\t\t\t\t\t$admin_menu->refresh_menu_page_data( 'options-general.php' );\n\t\t\t\t\t} else {\n\t\t\t\t\t\t$admin_menu->sort_submenu( 'options-general.php' );\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t// If now there is only the dashboard left, hide the entire dashboard menu.\n\t\t\tif ( $submenu_page_count < 2 ) {\n\t\t\t\t$admin_menu->remove_menu_page( 'index.php' );\n\n\t\t\t\t// If there is no other menu above the first separator, hide the separator as well.\n\t\t\t\t$sorted_menu = $menu;\n\t\t\t\tksort( $sorted_menu );\n\t\t\t\tif ( key( $sorted_menu ) === 4 ) {\n\t\t\t\t\tunset( $menu[4] );\n\t\t\t\t}\n\n\t\t\t\t// Redirect to another startup screen when index.php is hit.\n\t\t\t\tadd_action(\n\t\t\t\t\t'admin_init',\n\t\t\t\t\tstatic function () {\n\t\t\t\t\t\tglobal $pagenow;\n\n\t\t\t\t\t\t// Do not redirect if any request parameters are present as that may break certain actions.\n\t\t\t\t\t\t// phpcs:ignore WordPress.Security.NonceVerification.Recommended\n\t\t\t\t\t\tif ( 'index.php' === $pagenow && empty( $_REQUEST ) ) {\n\t\t\t\t\t\t\t$config         = Shared\\Config::instance();\n\t\t\t\t\t\t\t$startup_screen = $config->get( 'replace_dashboard_startup_screen', '' );\n\t\t\t\t\t\t\tif ( ! $startup_screen ) {\n\t\t\t\t\t\t\t\tif ( current_user_can( 'edit_posts' ) ) {\n\t\t\t\t\t\t\t\t\t$startup_screen = 'edit.php';\n\t\t\t\t\t\t\t\t} elseif ( current_user_can( 'manage_options' ) ) {\n\t\t\t\t\t\t\t\t\t$startup_screen = 'options-general.php';\n\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t$startup_screen = 'profile.php';\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twp_safe_redirect( admin_url( $startup_screen ) );\n\t\t\t\t\t\t\texit;\n\t\t\t\t\t\t}\n\t\t\t\t\t},\n\t\t\t\t\t100\n\t\t\t\t);\n\t\t\t}\n\t\t}\n\t},\n\tPHP_INT_MAX\n);\n"
    }
];
    return steps;
}
customSteps.hideDashboard.felixArntzMuPlugins = true;
customSteps.hideDashboard.info = "Hides the WordPress dashboard if no additional submenu pages are added to it.";
