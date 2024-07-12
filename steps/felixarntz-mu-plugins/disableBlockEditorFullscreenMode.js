customSteps.disableBlockEditorFullscreenMode = function() {
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
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins/disable-block-editor-fullscreen-mode.php",
        "data": "<?php\n/**\n * Plugin Name: Disable Block Editor Full Screen Mode\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Disables the block editor's full screen mode by default.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_action(\n\t'enqueue_block_editor_assets',\n\tstatic function () {\n\t\t$script = \"window.onload = function() { const isFullscreenMode = wp.data.select( 'core/edit-post' ).isFeatureActive( 'fullscreenMode' ); if ( isFullscreenMode ) { wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'fullscreenMode' ); } }\";\n\t\twp_add_inline_script( 'wp-blocks', $script );\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.disableBlockEditorFullscreenMode.felixArntzMuPlugins = true;
customSteps.disableBlockEditorFullscreenMode.info = "Disables the block editor's full screen mode by default.";
