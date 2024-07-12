customSteps.disableLegacyCss = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/disable-legacy-css.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Legacy CSS\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Removes legacy CSS from certain widgets and shortcodes from wp_head output.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter( 'show_recent_comments_widget_style', '__return_false' );\nadd_filter( 'use_default_gallery_style', '__return_false' );\n"
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
customSteps.disableLegacyCss.info = "Removes legacy CSS from certain widgets and shortcodes from wp_head output.";
