import { addFilter } from './addFilter.js';
import { installPlugin } from './installPlugin.js';
import { setSiteOption } from './setSiteOption.js';
import type { StepFunction, SkipWooCommerceWizardStep, StepResult, CompilationContext } from './types.js';

export const skipWooCommerceWizard: StepFunction<SkipWooCommerceWizardStep> = ( step: SkipWooCommerceWizardStep, context?: CompilationContext ): StepResult => {
	const addFilterResult = addFilter( {
		step: 'addFilter',
		stepIndex: step.stepIndex,
		vars: {
			filter: 'woocommerce_prevent_automatic_wizard_redirect',
			code: "'__return_true'"
		}
	} );

	const siteOptionResult = setSiteOption( {
		step: 'setSiteOption',
		vars: {
			name: 'woocommerce_onboarding_profile',
			value: { completed: true }
		}
	} );

	return {
		toV1() {
			let steps = [
				...( siteOptionResult.toV1().steps || [] ),
				...( addFilterResult.toV1().steps || [] )
			];
			const hasWoocommercePlugin = context?.hasStep( 'installPlugin', { url: 'woocommerce' } ) ?? false;
			if ( !hasWoocommercePlugin ) {
				const installWooCommerceSteps = installPlugin( { step: 'installPlugin', vars: { url: 'woocommerce' } } ).toV1();
				if ( installWooCommerceSteps.steps ) {
					steps = [...( installWooCommerceSteps.steps.filter( ( s ): s is NonNullable<typeof s> => !!s ) ), ...steps];
				}
			}
			return { steps, landingPage: '/wp-admin/admin.php?page=wc-admin' };
		},

		toV2() {
			const hasWoocommercePlugin = context?.hasStep( 'installPlugin', { url: 'woocommerce' } ) ?? false;
			return {
				version: 2,
				...( !hasWoocommercePlugin ? { plugins: [ 'woocommerce' ] } : {} ),
				phpExtensionBundles: [ 'kitchen-sink' ],
				siteOptions: siteOptionResult.toV2().siteOptions,
				muPlugins: addFilterResult.toV2().muPlugins,
				landingPage: '/wp-admin/admin.php?page=wc-admin'
			};
		}
	};
};

skipWooCommerceWizard.description = "When running WooCommerce, don't show the wizard.";
skipWooCommerceWizard.vars = [];