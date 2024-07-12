customSteps.modifyBlockPatterns = function() {
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
        "path": "wordpress/wp-content/mu-plugins/modify-block-patterns.php",
        "data": "<?php\n/**\n * Plugin Name: Modify Block Patterns\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Modifies which block patterns are available, also allowing to provide custom block pattern directories.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_action(\n\t'init',\n\tstatic function () {\n\t\t$config = Shared\\Config::instance();\n\n\t\t// Note: Disabling core patterns also disables remote patterns.\n\t\t$disable_core_patterns   = $config->get( 'disable_core_patterns', false );\n\t\t$disable_remote_patterns = $config->get( 'disable_remote_patterns', false );\n\t\tif ( $disable_core_patterns ) {\n\t\t\tremove_theme_support( 'core-block-patterns' );\n\t\t}\n\t\tif ( $disable_remote_patterns ) {\n\t\t\tadd_filter( 'should_load_remote_block_patterns', '__return_false' );\n\t\t}\n\n\t\t$custom_pattern_directories = array_filter( $config->get( 'custom_pattern_directories', array() ) );\n\t\tforeach ( $custom_pattern_directories as $custom_pattern_directory ) {\n\t\t\tif ( is_array( $custom_pattern_directory ) ) {\n\t\t\t\tif ( ! isset( $custom_pattern_directory['dir'] ) ) {\n\t\t\t\t\tcontinue;\n\t\t\t\t}\n\t\t\t\t$pattern_dir = $custom_pattern_directory['dir'];\n\t\t\t\t$version     = $custom_pattern_directory['version'] ?? '';\n\t\t\t\t$text_domain = $custom_pattern_directory['text_domain'] ?? '';\n\t\t\t} else {\n\t\t\t\t$pattern_dir = $custom_pattern_directory;\n\t\t\t\t$version     = '';\n\t\t\t\t$text_domain = '';\n\t\t\t}\n\n\t\t\t$parser = new Shared\\Block_Pattern_File_Parser( $pattern_dir, $version, $text_domain );\n\t\t\t$parser->register_block_patterns();\n\t\t}\n\t},\n\t9\n);\n"
    }
];
    return steps;
}
customSteps.modifyBlockPatterns.info = "Modifies which block patterns are available, also allowing to provide custom block pattern directories.";
