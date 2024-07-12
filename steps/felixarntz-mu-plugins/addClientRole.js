customSteps.addClientRole = function() {
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
        "path": "wordpress/wp-content/mu-plugins/felixarntz-mu-plugins/add-client-role.php",
        "data": "<?php\n/**\n * Plugin Name: Add Client Role\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Adds a role for clients with additional capabilities than editors, but not quite admin.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_action(\n\t'init',\n\tstatic function () {\n\t\t// The client role inherits all capabilities from the editor role.\n\t\t$editor_role = get_role( 'editor' );\n\t\tif ( ! $editor_role ) {\n\t\t\treturn;\n\t\t}\n\n\t\t$config = Shared\\Config::instance();\n\n\t\t$display_name    = $config->get( 'client_role_display_name', '' );\n\t\t$additional_caps = $config->get( 'client_role_additional_caps', array() );\n\t\tif ( ! $display_name ) {\n\t\t\t$display_name = 'Client';\n\t\t}\n\t\tif ( ! $additional_caps ) {\n\t\t\t$additional_caps = array(\n\t\t\t\t'update_core',\n\t\t\t\t'update_plugins',\n\t\t\t\t'update_themes',\n\t\t\t);\n\t\t}\n\n\t\t$capabilities = $editor_role->capabilities;\n\n\t\t// If an indexed array, transform it to a capabilities map with each capability granted.\n\t\tif ( isset( $additional_caps[0] ) ) {\n\t\t\t$additional_caps = array_fill_keys( $additional_caps, true );\n\t\t}\n\t\tforeach ( $additional_caps as $cap => $grant ) {\n\t\t\t// Do not allow removing capabilities.\n\t\t\tif ( isset( $capabilities[ $cap ] ) && $capabilities[ $cap ] ) {\n\t\t\t\tcontinue;\n\t\t\t}\n\t\t\t$capabilities[ $cap ] = $grant;\n\t\t}\n\n\t\t$roles = array(\n\t\t\t'felixarntz_client' => array(\n\t\t\t\t'display_name' => $display_name,\n\t\t\t\t'capabilities' => $capabilities,\n\t\t\t),\n\t\t);\n\n\t\t// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize\n\t\t$roles_hash      = md5( serialize( $roles ) );\n\t\t$roles_installed = get_option( 'felixarntz_roles_installed' );\n\t\tif ( $roles_installed !== $roles_hash ) {\n\t\t\tforeach ( $roles as $role => $data ) {\n\t\t\t\tremove_role( $role );\n\t\t\t\tadd_role( $role, $data['display_name'], $data['capabilities'] );\n\t\t\t}\n\t\t\tupdate_option( 'felixarntz_roles_installed', $roles_hash );\n\t\t}\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.addClientRole.felixArntzMuPlugins = true;
customSteps.addClientRole.info = "Adds a role for clients with additional capabilities than editors, but not quite admin.";
