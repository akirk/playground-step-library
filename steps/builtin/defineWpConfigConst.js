customSteps.defineWpConfigConst = function( step ) {
	const constStep = {
		"step": "defineWpConfigConsts",
		"consts": {}
	};
	constStep.consts[step.vars.name] = step.vars.value;
	return [ constStep ];
};
customSteps.defineWpConfigConst.info = "Define a wp-config PHP constant.";
customSteps.defineWpConfigConst.builtin = true;
customSteps.defineWpConfigConst.vars = [
	{
		"name": "name",
		"description": "Constant name",
		"samples": [ "WP_DEBUG" ]
	},
	{
		"name": "value",
		"description": "Constant value",
		"samples": [ "true" ]
	}
];
