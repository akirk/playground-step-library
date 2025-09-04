customSteps.showAdminNotice = function (step) {
	const dismissible = step?.vars?.dismissible ? ' is-dismissible' : '';
	const text = step?.vars?.text.replace(/'/g, "\\'");

	const dismissible_php = step?.vars?.dismissible ? `$dismissed = get_user_option( 'dismissed_expose_blueprint_notice-${step?.vars?.stepIndex}', get_current_user_id() );

		if ( $dismissed ) {
			return;
		}
` : '';
	let php = `<?php
add_action(
	'admin_notices',
	function() {
		${dismissible_php}
		echo '<div class="notice notice-${step?.vars?.type}${dismissible}" id="custom-admin-notice-${step?.vars?.stepIndex}"><p>' . esc_html( '${text}' ) . '</p></div>';
	}
);`;

	if (step?.vars?.dismissible) {
		php += `
add_action('wp_ajax_dismiss_custom-admin-notice-${step?.vars?.stepIndex}', function() {
	check_ajax_referer('custom-admin-notice-${step?.vars?.stepIndex}', 'nonce');

	$user_id = get_current_user_id();
	if ( $user_id ) {
		update_user_option($user_id, 'dismissed_expose_blueprint_notice-${step?.vars?.stepIndex}', 1, false);
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
		var nonce = '<?php echo esc_html( wp_create_nonce( 'custom-admin-notice-${step?.vars?.stepIndex}' ) ); ?>';

		$( '#custom-admin-notice-${step?.vars?.stepIndex}' ).on( 'click', '.notice-dismiss', function() {
			$.ajax({
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'dismiss_custom-admin-notice-${step?.vars?.stepIndex}',
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
	var steps = [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/show-admin-notice-${stepIndex}.php",
			"data": php
		}
	];
	steps.landingPage = '/wp-admin/';
	return steps;
}
customSteps.showAdminNotice.description = "Show an admin notice in the dashboard.";
customSteps.showAdminNotice.vars = [
	{
		"name": "text",
		"description": "The notice to be displayed",
		"required": true,
		"samples": ["Welcome to WordPress Playground!", "This is a demo of the Step Library"]
	},
	{
		"name": "type",
		"description": "The type of notice",
		"type": "select",
		"options": ["success", "info", "warning", "error"],
		"samples": ["success"]
	},
	{
		"name": "dismissible",
		"description": "Allow to dismiss",
		"type": "boolean",
		"samples": [true]
	}
];
