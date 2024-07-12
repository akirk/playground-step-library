customSteps.disableEmoji = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-emoji.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Emoji\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Removes emoji script and related logic.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nremove_action( 'wp_head', 'print_emoji_detection_script', 7 );\nremove_action( 'admin_print_scripts', 'print_emoji_detection_script' );\nremove_action( 'wp_print_styles', 'print_emoji_styles' );\nremove_action( 'admin_print_styles', 'print_emoji_styles' );\nremove_filter( 'the_content_feed', 'wp_staticize_emoji' );\nremove_filter( 'comment_text_rss', 'wp_staticize_emoji' );\nremove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );\nadd_filter( 'emoji_svg_url', '__return_false' );\n"
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
customSteps.disableEmoji.info = "Removes emoji script and related logic.";
