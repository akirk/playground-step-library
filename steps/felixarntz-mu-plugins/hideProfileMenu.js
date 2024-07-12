customSteps.hideProfileMenu = function() {
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
        "path": "wordpress/wp-content/mu-plugins/hide-profile-menu.php",
        "data": "<?php\n/**\n * Plugin Name: Hide Profile Menu\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Hides the Profile submenu item and, if applicable, menu item in favor of link in account menu.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_action(\n\t'admin_menu',\n\tstatic function () {\n\t\t$admin_menu = Shared\\Admin_Menu::instance();\n\n\t\t// If full Users menu is present, remove Profile submenu item.\n\t\tif ( $admin_menu->get_menu_page( 'users.php' ) ) {\n\t\t\t$admin_menu->remove_submenu_page( 'users.php', 'profile.php' );\n\t\t\treturn;\n\t\t}\n\n\t\t// Otherwise, remove the entire Profile menu item.\n\t\tif ( $admin_menu->get_menu_page( 'profile.php' ) ) {\n\t\t\tif ( $admin_menu->remove_submenu_page( 'profile.php', 'profile.php' ) ) {\n\t\t\t\t// If there are any extra items, move them under Settings.\n\t\t\t\t$submenu_page = $admin_menu->get_first_submenu_page( 'profile.php' );\n\t\t\t\twhile ( $submenu_page ) {\n\t\t\t\t\tif ( $admin_menu->move_submenu_page( 'profile.php', $submenu_page[2], 'options-general.php' ) ) {\n\t\t\t\t\t\t$submenu_page = $admin_menu->get_first_submenu_page( 'profile.php' );\n\t\t\t\t\t} else {\n\t\t\t\t\t\t$submenu_page = array();\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t},\n\tPHP_INT_MAX\n);\n"
    }
];
    return steps;
}
customSteps.hideProfileMenu.info = "Hides the Profile submenu item and, if applicable, menu item in favor of link in account menu.";
