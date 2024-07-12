customSteps.removeDashboardWidgets = function() {
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
        "path": "wordpress/wp-content/mu-plugins/remove-dashboard-widgets.php",
        "data": "<?php\n/**\n * Plugin Name: Remove Dashboard Widgets\n * Plugin URI: https://github.com/felixarntz/felixarntz-mu-plugins\n * Description: Removes all default widgets from the WordPress dashboard.\n * Author: Felix Arntz\n * Author URI: https://felix-arntz.me\n * License: GPLv2 or later\n * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html\n * Text Domain: felixarntz-mu-plugins\n *\n * @package felixarntz-mu-plugins\n */\n\nnamespace Felix_Arntz\\MU_Plugins;\n\nif ( ! defined( 'ABSPATH' ) ) {\n\texit; // Exit if accessed directly.\n}\n\nrequire_once __DIR__ . '/shared/loader.php';\n\nadd_action(\n\t'do_meta_boxes',\n\tstatic function ( $screen_id ) {\n\t\tglobal $wp_meta_boxes;\n\n\t\tif ( 'dashboard' !== $screen_id ) {\n\t\t\treturn;\n\t\t}\n\n\t\t// Remove Welcome panel.\n\t\tremove_action( 'welcome_panel', 'wp_welcome_panel' );\n\n\t\t// Remove default widgets that are not very helpful.\n\t\t$default_widgets = array(\n\t\t\t'dashboard_right_now'         => 'normal',\n\t\t\t'network_dashboard_right_now' => 'normal',\n\t\t\t'dashboard_activity'          => 'normal',\n\t\t\t'dashboard_quick_press'       => 'side',\n\t\t\t'dashboard_primary'           => 'side',\n\t\t);\n\t\tforeach ( $default_widgets as $widget_id => $context ) {\n\t\t\tremove_meta_box( $widget_id, $screen_id, $context );\n\t\t}\n\n\t\t// Remove Site Health unless there are critical issues or recommendations.\n\t\tif ( isset( $wp_meta_boxes[ $screen_id ]['normal']['core']['dashboard_site_health'] ) ) {\n\t\t\t$get_issues = get_transient( 'health-check-site-status-result' );\n\t\t\tif ( false === $get_issues ) {\n\t\t\t\tremove_meta_box( 'dashboard_site_health', $screen_id, 'normal' );\n\t\t\t} else {\n\t\t\t\t$issue_counts = json_decode( $get_issues, true );\n\t\t\t\tif ( empty( $issue_counts['critical'] ) && empty( $issue_counts['recommended'] ) ) {\n\t\t\t\t\tremove_meta_box( 'dashboard_site_health', $screen_id, 'normal' );\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\t$config             = Shared\\Config::instance();\n\t\t$additional_widgets = $config->get( 'remove_dashboard_widgets', array() );\n\t\tif ( ! $additional_widgets ) {\n\t\t\treturn;\n\t\t}\n\t\tforeach ( $additional_widgets as $widget_id => $context ) {\n\t\t\tremove_meta_box( $widget_id, $screen_id, $context );\n\t\t}\n\t}\n);\n"
    }
];
    return steps;
}
customSteps.removeDashboardWidgets.info = "Removes all default widgets from the WordPress dashboard.";
