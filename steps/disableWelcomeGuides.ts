import type { StepFunction, DisableWelcomeGuidesStep, StepResult } from './types.js';
import { muPlugin } from './muPlugin.js';

export const disableWelcomeGuides: StepFunction<DisableWelcomeGuidesStep> = (step: DisableWelcomeGuidesStep): StepResult => {
	const code = `
function my_disable_welcome_guides() {
	wp_add_inline_script( 'wp-data', "window.onload = function() {
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuide', false );
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuideStyles', false );
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuidePage', false );
		window.wp.data.dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuideTemplate', false );
}" );
}

add_action( 'enqueue_block_editor_assets', 'my_disable_welcome_guides', 20 );
`;

	return muPlugin({
		step: 'muPlugin',
		stepIndex: step.stepIndex,
		vars: {
			name: 'disable-welcome-guides',
			code
		}
	});
};

disableWelcomeGuides.description = "Disable the welcome guides in the site editor.";
disableWelcomeGuides.vars = [];