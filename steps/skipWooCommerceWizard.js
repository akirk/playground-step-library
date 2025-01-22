customSteps.skipWooCommerceWizard = function( step, blueprint ) {
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

   	for ( const i in blueprint.steps ) {
		if ( blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'woocommerce' ) {
			hasWoocommercePlugin = true;
		}
	}
	if ( ! hasWoocommercePlugin ) {
		steps = customSteps.installPlugin( { vars: { url: 'woocommerce' }} ).concat( steps );
	}
	steps.landingPage = '/wp-admin/admin.php?page=wc-admin';
	return steps;

};
customSteps.skipWooCommerceWizard.info = "When running WooCommerce, don't show the wizard.";
customSteps.skipWooCommerceWizard.vars = [];
