customSteps.blueprintExtractor = function ( step ) {
	return customSteps.githubPlugin( {
		vars: {
			url: "https://github.com/akirk/blueprint-extractor",
			branch: "main",
		}
	} );
};
customSteps.blueprintExtractor.info = "Generate a new blueprint after modifying the WordPress.";
