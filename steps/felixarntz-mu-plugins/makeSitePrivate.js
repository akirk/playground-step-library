customSteps.makeSitePrivate = function() {
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
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins/make-site-private.php",
        "data": "<?php\n/**\n * Plugin Name: Make Site Private\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Makes the entire site private so that only logged-in users can see the content.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\n// Redirect regular non logged-in traffic.\nadd_action(\n\t'wp',\n\tstatic function () {\n\t\t// Don't redirect if the user is logged in - obviously.\n\t\tif ( current_user_can( 'read' ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// Don't redirect REST request, instead use authentication error.\n\t\tif ( defined( 'REST_REQUEST' ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// Don't redirect any of these screens.\n\t\t$exclusions = array(\n\t\t\t'wp-login.php'     => true,\n\t\t\t'wp-activate.php'  => true,\n\t\t\t'wp-signup.php'    => true,\n\t\t\t'wp-cron.php'      => true,\n\t\t\t'wp-trackback.php' => true,\n\t\t\t'xmlrpc.php'       => true,\n\t\t);\n\t\tif ( isset( $exclusions[ basename( $_SERVER['PHP_SELF'] ) ] ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t/*\n\t\t * Set no-cache headers and redirect.\n\t\t * Do not use \\`auth_redirect()\\` here as it may not work in Chrome.\n\t\t */\n\t\tnocache_headers();\n\t\twp_safe_redirect(\n\t\t\twp_login_url(\n\t\t\t\tset_url_scheme( 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] )\n\t\t\t)\n\t\t);\n\t\texit;\n\t}\n);\n\n// Force REST API error if not logged in.\nadd_filter(\n\t'rest_authentication_errors',\n\tstatic function ( $result ) {\n\t\t// If there is an error already, pass it through.\n\t\tif ( is_wp_error( $result ) ) {\n\t\t\treturn $result;\n\t\t}\n\n\t\tif ( ! is_user_logged_in() ) {\n\t\t\treturn new \\WP_Error(\n\t\t\t\t'rest_not_logged_in',\n\t\t\t\t__( 'You need to be logged in to access this content.', 'felixarntz-mu-plugins' ),\n\t\t\t\tarray( 'status' => 401 )\n\t\t\t);\n\t\t}\n\n\t\treturn $result;\n\t}\n);\n\n// Show login error message based on redirect.\nadd_action(\n\t'init',\n\tstatic function () {\n\t\tglobal $error;\n\n\t\t// phpcs:ignore WordPress.Security.NonceVerification\n\t\tif ( 'wp-login.php' !== basename( $_SERVER['PHP_SELF'] ) || ! empty( $_POST ) || ( ! empty( $_GET ) && empty( $_GET['redirect_to'] ) ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// If there is no redirect or it is pointing to the admin, there is no need to show the custom error.\n\t\t// phpcs:ignore WordPress.Security.NonceVerification.Recommended\n\t\t$redirect = isset( $_GET['redirect_to'] ) ? $_GET['redirect_to'] : '';\n\t\tif ( ! $redirect || str_starts_with( $redirect, admin_url() ) ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited\n\t\t$error = __( 'You need to be logged in to access this content.', 'felixarntz-mu-plugins' );\n\t}\n);\n\n// Disable indexing.\nadd_action( 'pre_option_blog_public', '__return_zero' );\n"
    }
];
    return steps;
}
customSteps.makeSitePrivate.felixArntzMuPlugins = true;
customSteps.makeSitePrivate.info = "Makes the entire site private so that only logged-in users can see the content.";
