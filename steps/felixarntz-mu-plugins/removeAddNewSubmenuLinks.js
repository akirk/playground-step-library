customSteps.removeAddNewSubmenuLinks = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/remove-add-new-submenu-links.php",
        "data": "<?php\n/**\n * Plugin Name: Remove Add New Submenu Links\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Removes all the Add New submenu items in the admin.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_action(\n\t'admin_menu',\n\tstatic function () {\n\t\t$admin_menu = Shared\\Admin_Menu::instance();\n\n\t\t$add_new_items = array(\n\t\t\t'edit.php'    => 'post-new.php',\n\t\t\t'upload.php'  => 'media-new.php',\n\t\t\t'plugins.php' => 'plugin-install.php',\n\t\t\t'users.php'   => 'user-new.php',\n\t\t);\n\t\tforeach ( $add_new_items as $menu_file => $submenu_file ) {\n\t\t\t$admin_menu->remove_submenu_page( $menu_file, $submenu_file );\n\t\t}\n\n\t\t$menu_tmpl    = 'edit.php?post_type=%s';\n\t\t$submenu_tmpl = 'post-new.php?post_type=%s';\n\t\t$post_types   = get_post_types(\n\t\t\tarray(\n\t\t\t\t'show_ui'      => true,\n\t\t\t\t'show_in_menu' => true,\n\t\t\t)\n\t\t);\n\t\tforeach ( $post_types as $post_type ) {\n\t\t\t$menu_file    = sprintf( $menu_tmpl, $post_type );\n\t\t\t$submenu_file = sprintf( $submenu_tmpl, $post_type );\n\t\t\t$admin_menu->remove_submenu_page( $menu_file, $submenu_file );\n\t\t}\n\t},\n\t9999\n);\n"
    },
    {
        "step": "unzip",
        "zipFile": {
            "resource": "url",
            "url": "http://localhost:8089/felixarntz-mu-plugins-shared.zip"
        },
        "extractToPath": "/wordpress/mu-plugins"
    }
];
    return steps;
}
customSteps.removeAddNewSubmenuLinks.info = "Removes all the Add New submenu items in the admin.";
