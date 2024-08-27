customSteps.setLandingPage = function( step ) {
	const steps = [];
	steps.landingPage = step.vars.landingPage;
	return steps;
};
customSteps.setLandingPage.info = "Set the landing page.";
customSteps.setLandingPage.vars = [
	{
		"name": "landingPage",
		"description": "The relative URL for the landing page",
		"required": true,
		"samples": [ "/" ]
	}
];
