customSteps.obscureWpHead = function() {
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
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins/obscure-wp-head.php",
        "data": "<?php\n/**\n * Plugin Name: Obscure WP Head\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Removes useless WordPress indicators from wp_head output.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_filter( 'the_generator', '__return_false' );\nremove_action( 'wp_head', 'rsd_link' );\nremove_action( 'wp_head', 'wlwmanifest_link' );\nremove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head' );\nremove_action( 'wp_head', 'wp_generator' );\nremove_action( 'wp_head', 'wp_shortlink_wp_head' );\n\n// The following removals are conditional as there is a reasonable benefit to keeping them.\nadd_action(\n\t'wp_loaded',\n\tstatic function () {\n\t\t$config        = Shared\\Config::instance();\n\t\t$remove_rest   = $config->get( 'remove_wp_head_rest_references', false );\n\t\t$remove_oembed = $config->get( 'remove_wp_head_oembed_references', false );\n\t\tif ( $remove_rest ) {\n\t\t\tremove_action( 'wp_head', 'rest_output_link_wp_head' );\n\t\t}\n\t\tif ( $remove_oembed ) {\n\t\t\tremove_action( 'wp_head', 'wp_oembed_add_discovery_links' );\n\t\t\tremove_action( 'wp_head', 'wp_oembed_add_host_js' );\n\t\t}\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.obscureWpHead.felixArntzMuPlugins = true;
customSteps.obscureWpHead.info = "Removes useless WordPress indicators from wp_head output.";
