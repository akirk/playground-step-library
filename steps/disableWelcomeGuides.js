
customSteps.disableWelcomeGuides = function() {
	var steps = [
		{
			"step": "mkdir",
			"path": "wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "wordpress/wp-content/mu-plugins/disable-welcome-guides.php",
			"data": `<?php
function my_disable_welcome_guides() {
	wp_add_inline_script( 'wp-data', "window.onload = function() {
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuide', false );
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuideStyles', false );
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuidePage', false );
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuideTemplate', false );
}" );
}

add_action( 'enqueue_block_editor_assets', 'my_disable_welcome_guides', 20 );
`
		}
	];
	return steps;
};
