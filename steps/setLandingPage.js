customSteps.setLandingPage = function( step ) {
	const steps = [];
	steps.landingPage = step.vars.landingPage;
	return steps;
};
customSteps.setLandingPage.description = "Set the landing page.";
customSteps.setLandingPage.vars = [
	{
		"name": "landingPage",
		"description": "The relative URL for the landing page",
		"required": true,
		"samples": [ "/", "/wp-admin/", "/wp-admin/post-new.php", "/wp-admin/post-new.php?post_type=page" ]
	}
];
