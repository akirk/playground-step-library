import type { StepFunction, RemoveDashboardWidgetsStep, StepResult } from './types.js';
import { muPlugin } from './muPlugin.js';


export const removeDashboardWidgets: StepFunction<RemoveDashboardWidgetsStep> = (step: RemoveDashboardWidgetsStep): StepResult => {
	// Adapted from https://github.com/felixarntz/felixarntz-mu-plugins/blob/main/felixarntz-mu-plugins/remove-dashboard-widgets.php
	const code = `<?php
add_action(
	'do_meta_boxes',
	static function ( $screen_id ) {
		global $wp_meta_boxes;

		if ( 'dashboard' !== $screen_id ) {
			return;
		}

		if ( ${step?.welcome} ) {
			remove_action( 'welcome_panel', 'wp_welcome_panel' );
		}
		$default_widgets = array();
		if ( ${step?.glance} ) {
			$default_widgets['dashboard_right_now'] = 'normal';
		}
		if ( ${step?.events} ) {
			$default_widgets['dashboard_primary'] = 'side';
		}
		if ( ${step?.quickpress} ) {
			$default_widgets['dashboard_quick_press'] = 'side';
		}
		if ( ${step?.activity} ) {
			$default_widgets['dashboard_activity'] = 'normal';
		}
		foreach ( $default_widgets as $widget_id => $context ) {
			remove_meta_box( $widget_id, $screen_id, $context );
		}

		if ( ${step?.sitehealth} ) {
			// Remove Site Health unless there are critical issues or recommendations.
			if ( isset( $wp_meta_boxes[ $screen_id ]['normal']['core']['dashboard_site_health'] ) ) {
				$get_issues = get_transient( 'health-check-site-status-result' );
				if ( false === $get_issues ) {
					remove_meta_box( 'dashboard_site_health', $screen_id, 'normal' );
				} else {
					$issue_counts = json_decode( $get_issues, true );
					if ( empty( $issue_counts['critical'] ) && empty( $issue_counts['recommended'] ) ) {
						remove_meta_box( 'dashboard_site_health', $screen_id, 'normal' );
					}
				}
			}
		}
	}
);`;

	return muPlugin({
		name: 'remove-dashboard-widgets',
		code
	});
};

removeDashboardWidgets.description = "Remove widgets from the wp-admin dashboard.";
removeDashboardWidgets.vars = [
	{
		name: "welcome",
		description: "Remove Welcome Panel",
		type: 'boolean',
		samples: [ "true" ]
	},
	{
		name: "glance",
		description: "Remove At a Glance",
		type: 'boolean',
		samples: [ "true" ]
	},
	{
		name: "events",
		description: "Remove Upcoming Events",
		type: 'boolean',
		samples: [ "true" ]
	},
	{
		name: "quickpress",
		description: "Remove Quick Draft",
		type: 'boolean',
		samples: [ "true" ]
	},
	{
		name: "activity",
		description: "Remove Activity",
		type: 'boolean',
		samples: [ "true" ]
	},
	{
		name: "sitehealth",
		description: "Remove Site Health",
		type: 'boolean',
		samples: [ "true" ]
	}
];