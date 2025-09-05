import { installPlugin } from './installPlugin.js';
export const skipWooCommerceWizard = (step, blueprint) => {
    let steps = [
        {
            "step": "runPHP",
            "code": "<?php require '/wordpress/wp-load.php'; update_option( 'woocommerce_onboarding_profile', [ 'completed' => true ] );"
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
        for (const i in blueprint.steps) {
            if (blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.url === 'woocommerce') {
                hasWoocommercePlugin = true;
            }
        }
    }
    if (!hasWoocommercePlugin) {
        const installWooCommerceSteps = installPlugin({ step: 'installPlugin', url: 'woocommerce' });
        steps = installWooCommerceSteps.concat(steps);
    }
    steps.landingPage = '/wp-admin/admin.php?page=wc-admin';
    return steps;
};
skipWooCommerceWizard.description = "When running WooCommerce, don't show the wizard.";
skipWooCommerceWizard.vars = [];
//# sourceMappingURL=skipWooCommerceWizard.js.map