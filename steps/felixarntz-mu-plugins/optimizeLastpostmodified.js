customSteps.optimizeLastpostmodified = function() {
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
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins/optimize-lastpostmodified.php",
        "data": "<?php\n/**\n * Plugin Name: Optimize Last Post Modified\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Optimizes the logic to get last post modified to avoid database queries for better performance.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\n/**\n * Gets the value of a specific 'lastpostmodified' option.\n *\n * @param string $timezone  Timezone. Either 'gmt', 'server', or 'blog'.\n * @param string $post_type Optional. Post type slug, or 'any' for the overall value. Default 'any'.\n * @return mixed Option value.\n */\nfunction get_lastpostmodified_option( $timezone, $post_type = 'any' ) {\n\t$option_name = sprintf( 'felixarntz_lastpostmodified_%s_%s', strtolower( $timezone ), $post_type );\n\treturn get_option( $option_name, '' );\n}\n\n/**\n * Updates the value of a specific 'lastpostmodified' option.\n *\n * @param string $time      Timestamp to set, in 'Y-m-d H:i:s' format.\n * @param string $timezone  Timezone. Either 'gmt', 'server', or 'blog'.\n * @param string $post_type Optional. Post type slug, or 'any' for the overall value. Default 'any'.\n * @return bool True on success, false on failure.\n */\nfunction update_lastpostmodified_option( $time, $timezone, $post_type = 'any' ) {\n\t$option_name = sprintf( 'felixarntz_lastpostmodified_%s_%s', strtolower( $timezone ), $post_type );\n\treturn (bool) update_option( $option_name, $time, false );\n}\n\n/**\n * Checks whether the 'lastpostmodified' option value for the given post type is locked.\n *\n * Whenever the value is being updated, it will be locked for 30 seconds to avoid excessive database writes.\n *\n * @param string $post_type Post type slug.\n * @return bool True if the option value is locked, false otherwise.\n */\nfunction is_lastpostmodified_option_locked( $post_type ) {\n\t$key = sprintf( 'felixarntz_lastpostmodified_%s_lock', $post_type );\n\treturn false === wp_cache_add( $key, 1, false, 30 );\n}\n\n// Override 'lastpostmodified' to use value stored in option, if available.\nadd_filter(\n\t'pre_get_lastpostmodified',\n\tstatic function ( $lastpostmodified, $timezone, $post_type ) {\n\t\t$stored_lastpostmodified = get_lastpostmodified_option( $timezone, $post_type );\n\t\tif ( ! $stored_lastpostmodified ) {\n\t\t\treturn $lastpostmodified;\n\t\t}\n\n\t\treturn $stored_lastpostmodified;\n\t},\n\t10,\n\t3\n);\n\n// Update 'lastpostmodified' option values when post status is updated, unless there is an active lock.\nadd_action(\n\t'transition_post_status',\n\tstatic function ( $new_status, $old_status, $post ) {\n\t\tif ( ! in_array( 'publish', array( $old_status, $new_status ), true ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t$public_post_types = get_post_types( array( 'public' => true ) );\n\t\tif ( ! in_array( $post->post_type, $public_post_types, true ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\tif ( is_lastpostmodified_option_locked( $post->post_type ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// Update overall value for 'any'.\n\t\tupdate_lastpostmodified_option( $post->post_modified_gmt, 'gmt' );\n\t\tupdate_lastpostmodified_option( $post->post_modified_gmt, 'server' );\n\t\tupdate_lastpostmodified_option( $post->post_modified, 'blog' );\n\n\t\t// Update value for post_type.\n\t\tupdate_lastpostmodified_option( $post->post_modified_gmt, 'gmt', $post->post_type );\n\t\tupdate_lastpostmodified_option( $post->post_modified_gmt, 'server', $post->post_type );\n\t\tupdate_lastpostmodified_option( $post->post_modified, 'blog', $post->post_type );\n\t},\n\t10,\n\t3\n);\n"
    }
];
    return steps;
}
customSteps.optimizeLastpostmodified.felixArntzMuPlugins = true;
customSteps.optimizeLastpostmodified.info = "Optimizes the logic to get last post modified to avoid database queries for better performance.";
