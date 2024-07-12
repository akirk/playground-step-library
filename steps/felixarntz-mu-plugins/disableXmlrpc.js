customSteps.disableXmlrpc = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-xmlrpc.php",
        "data": "<?php\n/**\n * Plugin Name: Disable XML-RPC\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables XML-RPC access to the site.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter( 'xmlrpc_enabled', '__return_false' );\n"
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
customSteps.disableXmlrpc.info = "Disables XML-RPC access to the site.";
