customSteps.disablePostTags = function() {
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
        "path": "wordpress/wp-content/mu-plugins/disable-post-tags.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Post Tags\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables using and assigning tags for posts (and other post types).\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter(\n\t'map_meta_cap',\n\tstatic function ( $caps, $cap ) {\n\t\tswitch ( $cap ) {\n\t\t\tcase 'manage_post_tags':\n\t\t\tcase 'edit_post_tags':\n\t\t\tcase 'delete_post_tags':\n\t\t\tcase 'assign_post_tags':\n\t\t\t\t$caps[] = 'do_not_allow';\n\t\t}\n\t\treturn $caps;\n\t},\n\t10,\n\t2\n);\n"
    }
];
    return steps;
}
customSteps.disablePostTags.info = "Disables using and assigning tags for posts (and other post types).";
