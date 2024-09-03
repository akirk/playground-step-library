customSteps.blueprintRecorder = function( step ) {
	return customSteps.githubPlugin( {
		vars: {
			repo: "akirk/blueprint-recorder",
			branch: "main",
		}
	});
};
customSteps.blueprintRecorder.info = "Record steps made and compile a new blueprint.";
