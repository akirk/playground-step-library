customSteps.fixToolsMenuCapability = function() {
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
        "path": "wordpress/wp-content/mu-plugins/fix-tools-menu-capability.php",
        "data": "<?php\n/**\n * Plugin Name: Fix Tools Menu Capability\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Ensures that the Tools menu is only shown if the user has the capabilities to do something with it.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_action(\n\t'admin_menu',\n\tstatic function () {\n\t\t// Bail if additional cards may be present under \"Available Tools\".\n\t\tif ( has_action( 'tool_box' ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t$admin_menu = Shared\\Admin_Menu::instance();\n\t\tif ( $admin_menu->update_menu_page_cap( 'tools.php', 'import' ) ) {\n\t\t\t$admin_menu->update_submenu_page_cap( 'tools.php', 'tools.php', 'import' );\n\t\t}\n\t},\n\tPHP_INT_MAX\n);\n"
    }
];
    return steps;
}
customSteps.fixToolsMenuCapability.info = "Ensures that the Tools menu is only shown if the user has the capabilities to do something with it.";
