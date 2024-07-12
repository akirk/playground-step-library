customSteps.useAmbiguousLoginError = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/use-ambiguous-login-error.php",
        "data": "<?php\n/**\n * Plugin Name: Use Ambiguous Login Error\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Modifies the error messages for a failed login attempt to be more ambiguous.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nadd_filter(\n\t'login_errors',\n\tstatic function ( $error ) {\n\t\tglobal $errors;\n\n\t\tif ( ! is_wp_error( $errors ) ) {\n\t\t\treturn $error;\n\t\t}\n\n\t\t$error_codes = array_intersect(\n\t\t\t$errors->get_error_codes(),\n\t\t\tarray(\n\t\t\t\t'invalid_username',\n\t\t\t\t'invalid_email',\n\t\t\t\t'incorrect_password',\n\t\t\t\t'invalidcombo',\n\t\t\t)\n\t\t);\n\t\tif ( $error_codes ) {\n\t\t\t$error  = '<strong>' . esc_html__( 'Error:', 'felixarntz-mu-plugins' ) . '<strong> ';\n\t\t\t$error .= esc_html__( 'The username/email address or password is incorrect. Please try again.', 'felixarntz-mu-plugins' );\n\t\t}\n\n\t\treturn $error;\n\t}\n);\n"
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
customSteps.useAmbiguousLoginError.info = "Modifies the error messages for a failed login attempt to be more ambiguous.";
