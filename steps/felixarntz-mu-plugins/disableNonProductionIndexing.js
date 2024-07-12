customSteps.disableNonProductionIndexing = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-non-production-indexing.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Non Production Indexing\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Ensures that the site is not indexable in a non-production environment.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nif ( wp_get_environment_type() !== 'production' && ! is_admin() ) {\n\tadd_action( 'pre_option_blog_public', '__return_zero' );\n}\n"
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
customSteps.disableNonProductionIndexing.info = "Ensures that the site is not indexable in a non-production environment.";
