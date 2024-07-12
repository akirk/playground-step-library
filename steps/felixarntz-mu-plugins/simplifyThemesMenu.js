customSteps.simplifyThemesMenu = function() {
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
        "path": "wordpress/wp-content/mu-plugins/simplify-themes-menu.php",
        "data": "<?php\n/**\n * Plugin Name: Simplify Themes Menu\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Simplifies the Themes Menu to be purely about editing if the current user cannot switch themes.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_action(\n\t'admin_menu',\n\tstatic function () {\n\t\tglobal $submenu;\n\n\t\t// Bail if the Themes submenu is not applicable.\n\t\tif ( ! isset( $submenu['themes.php'] ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// Bail if the user has full Themes access including switching themes.\n\t\tif ( current_user_can( 'switch_themes' ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// Only for classic themes, the theme code editor may also appear as a Themes submenu item.\n\t\tif ( ! wp_is_block_theme() && current_user_can( 'edit_themes' ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t$to_remove = array(\n\t\t\t__( 'Menus', 'default' )      => true,\n\t\t\t__( 'Header', 'default' )     => true,\n\t\t\t__( 'Background', 'default' ) => true,\n\t\t);\n\t\t// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited\n\t\t$submenu['themes.php'] = array_filter(\n\t\t\t$submenu['themes.php'],\n\t\t\tstatic function ( $submenu_item ) use ( $to_remove ) {\n\t\t\t\tif ( 'themes.php' === $submenu_item[2] ) {\n\t\t\t\t\treturn false;\n\t\t\t\t}\n\t\t\t\treturn ! isset( $to_remove[ $submenu_item[0] ] );\n\t\t\t}\n\t\t);\n\n\t\t/*\n\t\t * If there's only one item left in the Themes menu, it's either the Site Editor or Customizer, so make it the\n\t\t * only item.\n\t\t */\n\t\t$admin_menu = Shared\\Admin_Menu::instance();\n\t\tif ( $admin_menu->get_submenu_page_count( 'themes.php' ) === 1 && $admin_menu->get_menu_page( 'themes.php' ) ) {\n\t\t\t$first_submenu_page = $admin_menu->get_first_submenu_page( 'themes.php' );\n\t\t\tif ( _x( 'Editor', 'site editor menu item', 'default' ) === $first_submenu_page[0] ) {\n\t\t\t\t$admin_menu->update_submenu_page_menu_title( 'themes.php', $first_submenu_page[2], __( 'Site Editor', 'default' ) );\n\t\t\t}\n\t\t\t$admin_menu->refresh_menu_page_data( 'themes.php' );\n\t\t}\n\t},\n\tPHP_INT_MAX\n);\n"
    }
];
    return steps;
}
customSteps.simplifyThemesMenu.info = "Simplifies the Themes Menu to be purely about editing if the current user cannot switch themes.";
