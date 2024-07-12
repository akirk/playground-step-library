customSteps.disableRssLinks = function() {
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
        "path": "wordpress/wp-content/mu-plugins/disable-rss-links.php",
        "data": "<?php\n/**\n * Plugin Name: Disable RSS Links\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Removes RSS feed links from wp_head output.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nremove_action( 'wp_head', 'feed_links', 2 );\nremove_action( 'wp_head', 'feed_links_extra', 3 );\nadd_filter( 'feed_links_show_comments_feed', '__return_false' );\n"
    }
];
    return steps;
}
customSteps.disableRssLinks.info = "Removes RSS feed links from wp_head output.";
