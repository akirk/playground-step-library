customSteps.modifyRestRoot = function() {
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
        "path": "wordpress/wp-content/mu-plugins/modify-rest-root.php",
        "data": "<?php\n/**\n * Plugin Name: Modify Rest Root\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Modifies the REST API root to a different one, by default using api.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_filter(\n\t'rest_url_prefix',\n\tstatic function () {\n\t\t$config = Shared\\Config::instance();\n\t\treturn $config->get( 'rest_root', 'api' );\n\t}\n);\n\nadd_filter(\n\t'subdirectory_reserved_names',\n\tstatic function ( $names ) {\n\t\t$config  = Shared\\Config::instance();\n\t\t$names[] = $config->get( 'rest_root', 'api' );\n\t\treturn $names;\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.modifyRestRoot.info = "Modifies the REST API root to a different one, by default using api.";
