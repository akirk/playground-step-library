customSteps.enableMultisite = function (step) {
	const steps = [
		{
			"step": "enableMultisite"
		}
	];
	steps.landingPage = '/wp-admin/network/sites.php';
	return steps;
};
customSteps.enableMultisite.description = "Enable WordPress Multisite functionality.";
customSteps.enableMultisite.builtin = true;
