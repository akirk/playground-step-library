customSteps.enableMultisite = function( step ) {
	const steps = [
		{
		   "step": "enableMultisite"
	   }
	];
	steps.landingPage ='/wp-admin/network/sites.php';
	return steps;
};
customSteps.enableMultisite.builtin = true;
