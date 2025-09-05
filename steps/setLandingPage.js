export function setLandingPage( step ) {
	const steps = [];
	steps.landingPage = step.vars.landingPage;
	return steps;
};
setLandingPage.description = "Set the landing page.";
setLandingPage.vars = [
	{
		"name": "landingPage",
		"description": "The relative URL for the landing page",
		"required": true,
		"samples": [ "/", "/wp-admin/", "/wp-admin/post-new.php", "/wp-admin/post-new.php?post_type=page" ]
	}
];
