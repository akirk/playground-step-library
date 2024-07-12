customSteps.modernizeAccountMenuStyle = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/modernize-account-menu-style.php",
        "data": "<?php\n/**\n * Plugin Name: Modernize Account Menu Style\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Modifies the styling of the account menu in the admin bar to display a larger circled avatar image.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\n/**\n * Prints additional styles for the account menu in the admin bar.\n */\nfunction print_extra_admin_bar_account_menu_styles() {\n\tif ( ! is_admin_bar_showing() ) {\n\t\treturn;\n\t}\n\n\t?>\n\t<style type=\"text/css\">\n\t\t#wpadminbar #wp-admin-bar-my-account.with-avatar #wp-admin-bar-user-actions > li {\n\t\t\tmargin-left: 16px;\n\t\t}\n\n\t\t#wp-admin-bar-user-info {\n\t\t\tdisplay: block;\n\t\t\tpadding-bottom: 10px !important;\n\t\t\tborder-bottom: 1px solid #c3c4c7 !important;\n\t\t}\n\n\t\t#wp-admin-bar-user-info .avatar {\n\t\t\tposition: static;\n\t\t\tdisplay: block;\n\t\t\tmargin: 0 auto;\n\t\t\twidth: 128px;\n\t\t\theight: auto;\n\t\t\tborder-radius: 50%;\n\t\t}\n\n\t\t#wpadminbar #wp-admin-bar-user-info .display-name,\n\t\t#wpadminbar #wp-admin-bar-user-info .username {\n\t\t\tdisplay: block;\n\t\t\ttext-align: center;\n\t\t\theight: auto;\n\t\t}\n\t</style>\n\t<?php\n}\n\nadd_action( 'wp_head', __NAMESPACE__ . '\\\\print_extra_admin_bar_account_menu_styles' );\nadd_action( 'admin_head', __NAMESPACE__ . '\\\\print_extra_admin_bar_account_menu_styles' );\n"
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
customSteps.modernizeAccountMenuStyle.info = "Modifies the styling of the account menu in the admin bar to display a larger circled avatar image.";
