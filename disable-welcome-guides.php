<?php
function my_disable_welcome_guides() {
	wp_add_inline_script( 'wp-data', "window.onload = function() {
	const selectPost = wp.data.select( 'core/edit-post' );
	const selectPreferences = wp.data.select( 'core/preferences' );
	const isFullscreenMode = selectPost.isFeatureActive( 'fullscreenMode' );
	const isWelcomeGuidePost = selectPost.isFeatureActive( 'welcomeGuide' );
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
}" );
}

add_action( 'enqueue_block_editor_assets', 'my_disable_welcome_guides', 20 );
