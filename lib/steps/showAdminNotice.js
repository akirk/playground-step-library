export const showAdminNotice = (step) => {
    const dismissible = step?.dismissible ? ' is-dismissible' : '';
    const text = (step?.text || '').replace(/'/g, "\\'");
    const dismissible_php = step?.dismissible ? `$dismissed = get_user_option( 'dismissed_expose_blueprint_notice-${step?.stepIndex}', get_current_user_id() );

		if ( $dismissed ) {
			return;
		}
` : '';
    let php = `<?php
add_action(
	'admin_notices',
	function() {
		${dismissible_php}
		echo '<div class="notice notice-${step?.type}${dismissible}" id="custom-admin-notice-${step?.stepIndex}"><p>' . esc_html( '${text}' ) . '</p></div>';
	}
);`;
    if (step?.dismissible) {
        php += `
add_action('wp_ajax_dismiss_custom-admin-notice-${step?.stepIndex}', function() {
	check_ajax_referer('custom-admin-notice-${step?.stepIndex}', 'nonce');

	$user_id = get_current_user_id();
	if ( $user_id ) {
		update_user_option($user_id, 'dismissed_expose_blueprint_notice-${step?.stepIndex}', 1, false);
		wp_send_json_success();
	} else {
		wp_send_json_error('User not found');
	}
} );

add_action('admin_footer', function() {
	?>
	<script type="text/javascript">
	jQuery(document).ready( function($) {
		var ajaxurl = '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>';
		var nonce = '<?php echo esc_html( wp_create_nonce( 'custom-admin-notice-${step?.stepIndex}' ) ); ?>';

		$( '#custom-admin-notice-${step?.stepIndex}' ).on( 'click', '.notice-dismiss', function() {
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'dismiss_custom-admin-notice-${step?.stepIndex}',
					nonce: nonce
				}
			});
		});
	});
	</script>
	<?php
} );

`;
    }
    const steps = [
        {
            "step": "mkdir",
            "path": "/wordpress/wp-content/mu-plugins",
        },
        {
            "step": "writeFile",
            "path": `/wordpress/wp-content/mu-plugins/show-admin-notice-${step.stepIndex}.php`,
            "data": php
        }
    ];
    steps.landingPage = '/wp-admin/';
    return steps;
};
showAdminNotice.description = "Show an admin notice in the dashboard.";
showAdminNotice.vars = Object.entries({
    text: {
        description: "The notice to be displayed",
        required: true,
        samples: ["Welcome to WordPress Playground!", "This is a demo of the Step Library"]
    },
    type: {
        description: "The type of notice",
        type: "select",
        samples: ["success"]
    },
    dismissible: {
        description: "Allow to dismiss",
        type: "boolean",
        samples: ["true"]
    }
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=showAdminNotice.js.map