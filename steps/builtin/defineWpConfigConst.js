customSteps.defineWpConfigConst = function( step ) {
	if ( ! step.vars.name ) {
		return [];
	}
	const constStep = {
		"step": "defineWpConfigConsts",
		"consts": {}
	};
	if ( Array.isArray( step.vars.name ) ) {
		step.vars.name.forEach( ( name, index ) => {
			if ( ! name ) {
				return;
			}
			if ( step.vars.value[index] === 'true' ) {
				constStep.consts[name] = true;
			} else if ( step.vars.value[index] === 'false' ) {
				constStep.consts[name] = false;
			} else {
				constStep.consts[name] = step.vars.value[index];
			}
		} );
	} else {
		constStep.consts[step.vars.name] = step.vars.value;
	}
	return [ constStep ];
};
customSteps.defineWpConfigConst.info = "Define a wp-config PHP constant.";
customSteps.defineWpConfigConst.builtin = true;
customSteps.defineWpConfigConst.multiple = true;
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
