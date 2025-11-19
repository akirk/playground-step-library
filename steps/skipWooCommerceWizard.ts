import { installPlugin } from './installPlugin.js';
import type { StepFunction, SkipWooCommerceWizardStep , StepResult, V2SchemaFragments } from './types.js';

export const skipWooCommerceWizard: StepFunction<SkipWooCommerceWizardStep> = (step: SkipWooCommerceWizardStep, blueprint?: any): StepResult => {
	return {
		toV1() {
	let steps = [
		{
			"step": "runPHP",
			"code": "<?php require '/wordpress/wp-load.php'; update_option( 'woocommerce_onboarding_profile', [ 'completed' => true ] );",
			"progress": {
				"caption": "Skipping WooCommerce setup wizard"
			}
		},
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins/"
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/no-more-wizards.php",
			"data": "<?php require '/wordpress/wp-load.php'; add_filter( 'woocommerce_prevent_automatic_wizard_redirect', '__return_true' );"
		}
	];
	let hasWoocommercePlugin = false;

	if (blueprint) {
		for ( const i in blueprint.steps ) {
			if ( blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.url === 'woocommerce' ) {
				hasWoocommercePlugin = true;
			}
		}
	}
	if ( ! hasWoocommercePlugin ) {
		const installWooCommerceSteps = installPlugin({ step: 'installPlugin', url: 'woocommerce' }).toV1();
		steps = installWooCommerceSteps.concat( steps );
	}
	(steps as any).landingPage = '/wp-admin/admin.php?page=wc-admin';
	return steps;
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

skipWooCommerceWizard.description = "When running WooCommerce, don't show the wizard.";
skipWooCommerceWizard.vars = [];