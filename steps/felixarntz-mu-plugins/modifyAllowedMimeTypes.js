customSteps.modifyAllowedMimeTypes = function() {
    var steps = [
    {
        "step": "mkdir",
        "path": "wordpress/wp-content/mu-plugins"
    },
    {
        "step": "writeFile",
        "path": "wordpress/wp-content/mu-plugins/modify-allowed-mime-types.php",
        "data": "<?php\n/**\n * Plugin Name: Modify Allowed MIME Types\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Modifies the MIME types allowed for upload in the media library.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_filter(\n\t'upload_mimes',\n\tstatic function ( $mime_types ) {\n\t\t$config = Shared\\Config::instance();\n\n\t\t$allowed    = array_filter( $config->get( 'allowed_mime_types', array() ) );\n\t\t$disallowed = array_filter( $config->get( 'disallowed_mime_types', array() ) );\n\n\t\t// Bail without changes if no customizations are provided.\n\t\tif ( ! $allowed && ! $disallowed ) {\n\t\t\treturn $mime_types;\n\t\t}\n\n\t\t// Restructure the MIME types array to be keyed by type.\n\t\t$type_map = array();\n\t\tforeach ( $mime_types as $regex => $mime_type ) {\n\t\t\tlist( $type, $subtype ) = explode( '/', $mime_type, 2 );\n\t\t\tif ( ! isset( $type_map[ $type ] ) ) {\n\t\t\t\t$type_map[ $type ] = array();\n\t\t\t}\n\t\t\t$type_map[ $type ][ $mime_type ] = $regex;\n\t\t}\n\n\t\tif ( $allowed ) {\n\t\t\t$new_type_map = array();\n\t\t\tforeach ( $allowed as $allowed_mime ) {\n\t\t\t\t// If a full MIME type is provided, add it to the new type map.\n\t\t\t\tif ( str_contains( $allowed_mime, '/' ) ) {\n\t\t\t\t\tlist( $type, $subtype ) = explode( '/', $allowed_mime, 2 );\n\t\t\t\t\tif ( isset( $type_map[ $type ][ $allowed_mime ] ) ) {\n\t\t\t\t\t\tif ( ! isset( $new_type_map[ $type ] ) ) {\n\t\t\t\t\t\t\t$new_type_map[ $type ] = array();\n\t\t\t\t\t\t}\n\t\t\t\t\t\t$new_type_map[ $type ][ $allowed_mime ] = $type_map[ $type ][ $allowed_mime ];\n\t\t\t\t\t}\n\t\t\t\t\tcontinue;\n\t\t\t\t}\n\n\t\t\t\t// Otherwise, add all subtypes of the type to the new type map.\n\t\t\t\tif ( isset( $type_map[ $allowed_mime ] ) ) {\n\t\t\t\t\t$new_type_map[ $allowed_mime ] = $type_map[ $allowed_mime ];\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t$type_map = $new_type_map;\n\t\t}\n\n\t\tif ( $disallowed ) {\n\t\t\tforeach ( $disallowed as $disallowed_mime ) {\n\t\t\t\t// If a full MIME type is provided, remove it from the type map.\n\t\t\t\tif ( str_contains( $disallowed_mime, '/' ) ) {\n\t\t\t\t\tlist( $type, $subtype ) = explode( '/', $disallowed_mime, 2 );\n\t\t\t\t\tunset( $type_map[ $type ][ $disallowed_mime ] );\n\t\t\t\t\tcontinue;\n\t\t\t\t}\n\n\t\t\t\t// Otherwise, remove all subtypes of the type from the type map.\n\t\t\t\tunset( $type_map[ $disallowed_mime ] );\n\t\t\t}\n\t\t}\n\n\t\t// Rebuild the MIME types array.\n\t\t$mime_types = array();\n\t\tforeach ( $type_map as $type => $subtypes ) {\n\t\t\tforeach ( $subtypes as $mime_type => $regex ) {\n\t\t\t\t$mime_types[ $regex ] = $mime_type;\n\t\t\t}\n\t\t}\n\n\t\treturn $mime_types;\n\t}\n);\n"
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
customSteps.modifyAllowedMimeTypes.info = "Modifies the MIME types allowed for upload in the media library.";
