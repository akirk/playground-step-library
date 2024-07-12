customSteps.disablePosts = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-posts.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Posts\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables posts.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter(\n\t'map_meta_cap',\n\tstatic function ( $caps, $cap ) {\n\t\tswitch ( $cap ) {\n\t\t\tcase 'edit_posts': // While disabling this capability makes sense, it requires a workaround (see below).\n\t\t\tcase 'delete_posts':\n\t\t\tcase 'read_private_posts':\n\t\t\tcase 'edit_private_posts':\n\t\t\tcase 'delete_private_posts':\n\t\t\tcase 'edit_published_posts':\n\t\t\tcase 'delete_published_posts':\n\t\t\tcase 'edit_others_posts':\n\t\t\tcase 'delete_others_posts':\n\t\t\tcase 'publish_posts':\n\t\t\t\t$caps[] = 'do_not_allow';\n\t\t\t\tbreak;\n\t\t}\n\t\treturn $caps;\n\t},\n\t10,\n\t2\n);\n\n/*\n * These items have to be removed early.\n * Otherwise their existence will prevent other post type menu items from being accessible.\n */\nadd_action(\n\t'_admin_menu',\n\tstatic function () {\n\t\tremove_submenu_page( 'edit.php', 'edit.php' );\n\t\tremove_submenu_page( 'edit.php', 'post-new.php' );\n\t\tremove_menu_page( 'edit.php' );\n\t}\n);\n\nadd_action(\n\t'pre_get_posts',\n\tstatic function ( $query ) {\n\t\t$post_types = $query->get( 'post_type' );\n\t\tif ( is_array( $post_types ) ) {\n\t\t\t$key = array_search( 'post', $post_types, true );\n\t\t\tif ( false !== $key ) {\n\t\t\t\tunset( $post_types[ $key ] );\n\t\t\t\t$query->set( 'post_type', array_values( $post_types ) );\n\t\t\t}\n\t\t}\n\t}\n);\n\nadd_filter(\n\t'posts_results',\n\tstatic function ( $posts, $query ) {\n\t\t$post_type = $query->get( 'post_type' );\n\t\tif ( is_array( $post_type ) && in_array( 'post', $post_type, true ) ) {\n\t\t\treturn array_filter(\n\t\t\t\t$posts,\n\t\t\t\tstatic function ( $post ) {\n\t\t\t\t\treturn ! $post instanceof WP_Post || 'post' !== $post->post_type;\n\t\t\t\t}\n\t\t\t);\n\t\t}\n\n\t\tif ( is_string( $post_type ) && 'post' === $post_type ) {\n\t\t\treturn array();\n\t\t}\n\n\t\treturn $posts;\n\t},\n\t10,\n\t2\n);\n\nadd_filter(\n\t'pre_option_show_on_front',\n\tstatic function () {\n\t\treturn 'page';\n\t}\n);\nadd_filter(\n\t'pre_option_page_for_posts',\n\tstatic function () {\n\t\treturn 0;\n\t}\n);\n"
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
customSteps.disablePosts.info = "Disables posts.";