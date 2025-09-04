customSteps.blueprintRecorder = function ( step ) {
	return customSteps.githubPlugin( {
		vars: {
			url: "https://github.com/akirk/blueprint-recorder",
			branch: "main",
		}
	} );
};
customSteps.blueprintRecorder.description = "Record steps made and compile a new blueprint.";
