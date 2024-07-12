customSteps.optimizeMetaTableSchema = function() {
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
        "path": "wordpress/wp-content/mu-plugins/optimize-meta-table-schema.php",
        "data": "<?php\n/**\n * Plugin Name: Optimize Meta Table Schema\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Optimizes performance of the meta database tables by adding an index to the meta_value field.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter(\n\t'dbdelta_create_queries',\n\tstatic function ( $queries ) {\n\t\tglobal $wpdb;\n\n\t\t$meta_tables = array_fill_keys(\n\t\t\tarray(\n\t\t\t\t$wpdb->postmeta,\n\t\t\t\t$wpdb->termmeta,\n\t\t\t\t$wpdb->commentmeta,\n\t\t\t\t$wpdb->usermeta,\n\t\t\t),\n\t\t\ttrue\n\t\t);\n\n\t\tforeach ( $queries as $k => $q ) {\n\t\t\t// Replace meta_key index with one that indexes meta_value as well.\n\t\t\tif ( preg_match( '|CREATE TABLE ([^ ]*)|', $q, $matches ) && isset( $meta_tables[ $matches[1] ] ) ) {\n\t\t\t\t$queries[ $k ] = str_replace(\n\t\t\t\t\t'KEY meta_key (meta_key(191))',\n\t\t\t\t\t'KEY \\`felixarntz_meta_key_value\\` (\\`meta_key\\`(191), \\`meta_value\\`(100))',\n\t\t\t\t\t$q\n\t\t\t\t);\n\t\t\t}\n\t\t}\n\n\t\treturn $queries;\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.optimizeMetaTableSchema.info = "Optimizes performance of the meta database tables by adding an index to the meta_value field.";
