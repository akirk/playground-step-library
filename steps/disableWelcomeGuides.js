
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
	const selectPost = wp.data.select( 'core/edit-post' );
	const selectPreferences = wp.data.select( 'core/preferences' );
	const isFullscreenMode = selectPost.isFeatureActive( 'fullscreenMode' );
	const isWelcomeGuidePost = selectPost.isFeatureActive( 'welcomeGuide' );
	const isWelcomeGuideStylesPost = selectPost.isFeatureActive( 'welcomeGuideStyles' );
	const isWelcomeGuideWidget = selectPreferences.get( 'core/edit-widgets', 'welcomeGuide' );
	
	if ( isWelcomeGuideWidget ) {
		wp.data.dispatch( 'core/preferences' ).toggle( 'core/edit-widgets', 'welcomeGuide' );
	}
	
	if ( isFullscreenMode ) {
		wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'fullscreenMode' );
	}
	
	if ( isWelcomeGuidePost ) {
		wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
	}

	if ( isWelcomeGuideStylesPost ) {
		wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuideStyles' );
	}
}" );
}

add_action( 'enqueue_block_editor_assets', 'my_disable_welcome_guides', 20 );
`
		}
	];
	return steps;
};
