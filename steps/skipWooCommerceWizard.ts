import { installPlugin } from './installPlugin.js';
import type { StepFunction, SkipWooCommerceWizardStep, StepResult, CompilationContext } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const skipWooCommerceWizard: StepFunction<SkipWooCommerceWizardStep> = ( step: SkipWooCommerceWizardStep, context?: CompilationContext ): StepResult => {
	return {
		toV1() {
	let steps: Array<{ step: "runPHP"; code: string; progress?: { caption: string } } | { step: "mkdir"; path: string } | { step: "writeFile"; path: string; data: string }> = [
		{
			step: "runPHP" as const,
			code: "<?php require '/wordpress/wp-load.php'; update_option( 'woocommerce_onboarding_profile', [ 'completed' => true ] );",
			progress: {
				caption: "Skipping WooCommerce setup wizard"
			}
		},
		{
			step: "mkdir" as const,
			path: "/wordpress/wp-content/mu-plugins/"
		},
		{
			step: "writeFile" as const,
			path: "/wordpress/wp-content/mu-plugins/no-more-wizards.php",
			data: "<?php require '/wordpress/wp-load.php'; add_filter( 'woocommerce_prevent_automatic_wizard_redirect', '__return_true' );"
		}
	];
	const hasWoocommercePlugin = context?.hasStep( 'installPlugin', { url: 'woocommerce' } ) ?? false;
	if ( !hasWoocommercePlugin ) {
		const installWooCommerceSteps = installPlugin( { step: 'installPlugin', vars: { url: 'woocommerce' } } ).toV1();
		if ( installWooCommerceSteps.steps ) {
			steps = [...( installWooCommerceSteps.steps.filter( ( s ): s is NonNullable<typeof s> => !!s ) as typeof steps ), ...steps];
		}
	}
	return { steps, landingPage: '/wp-admin/admin.php?page=wc-admin' };
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

skipWooCommerceWizard.description = "When running WooCommerce, don't show the wizard.";
skipWooCommerceWizard.vars = [];