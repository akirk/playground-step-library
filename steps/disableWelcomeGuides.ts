import type { StepFunction, DisableWelcomeGuidesStep , StepResult, V2SchemaFragments } from './types.js';

export const disableWelcomeGuides: StepFunction<DisableWelcomeGuidesStep> = (step: DisableWelcomeGuidesStep): StepResult => {
	return {
		toV1() {
	return [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/disable-welcome-guides.php",
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
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
			};
		}
	};
};

disableWelcomeGuides.description = "Disable the welcome guides in the site editor.";
disableWelcomeGuides.vars = [];