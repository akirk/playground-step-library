customSteps.disablePingbacks = function() {
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
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins/disable-pingbacks.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Pingbacks\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables pingbacks and trackbacks.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\n// Force ping status to closed.\nadd_filter( 'pings_open', '__return_false' );\nadd_filter(\n\t'pre_option_default_ping_status',\n\tstatic function () {\n\t\treturn 'closed';\n\t}\n);\n\n// Hide UI to control ping status.\nadd_action(\n\t'admin_head',\n\tstatic function () {\n\t\tglobal $pagenow;\n\n\t\tif ( 'options-discussion.php' !== $pagenow ) {\n\t\t\treturn;\n\t\t}\n\n\t\t?>\n<style type=\"text/css\">\n\tlabel[for=\"default_ping_status\"],\n\tlabel[for=\"default_ping_status\"] + br {\n\t\tdisplay: none !important;\n\t}\n</style>\n\t\t<?php\n\t}\n);\n\n// Disable pingbacks in XML-RPC.\nadd_filter(\n\t'xmlrpc_methods',\n\tstatic function ( $methods ) {\n\t\tunset( $methods['pingback.ping'] );\n\t\treturn $methods;\n\t}\n);\nadd_action(\n\t'xmlrpc_call',\n\tstatic function ( $action ) {\n\t\tif ( 'pingback.ping' === $action ) {\n\t\t\twp_die( 'Pingbacks are not supported', 'Not Allowed!', array( 'response' => 403 ) );\n\t\t}\n\t}\n);\n\n// Remove X-Pingback response header.\nadd_filter(\n\t'wp_headers',\n\tstatic function ( $headers ) {\n\t\tunset( $headers['X-Pingback'] );\n\t\treturn $headers;\n\t}\n);\n\n// Remove 'trackbacks' support from all post types.\nadd_action(\n\t'init',\n\tstatic function () {\n\t\t$post_types = get_post_types();\n\t\tforeach ( $post_types as $post_type ) {\n\t\t\tif ( post_type_supports( $post_type, 'trackbacks' ) ) {\n\t\t\t\tremove_post_type_support( $post_type, 'trackbacks' );\n\t\t\t}\n\t\t}\n\t},\n\tPHP_INT_MAX\n);\n\n// Remove trackback rewrite rules.\nadd_filter(\n\t'rewrite_rules_array',\n\tstatic function ( $rules ) {\n\t\tforeach ( array_keys( $rules ) as $rule ) {\n\t\t\tif ( preg_match( '/trackback\\/\\?\\$$/i', $rule ) ) {\n\t\t\t\tunset( $rules[ $rule ] );\n\t\t\t}\n\t\t}\n\t\treturn $rules;\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.disablePingbacks.felixArntzMuPlugins = true;
customSteps.disablePingbacks.info = "Disables pingbacks and trackbacks.";
