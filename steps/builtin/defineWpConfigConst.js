export function defineWpConfigConst( step ) {
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
defineWpConfigConst.description = "Define a wp-config PHP constant.";
defineWpConfigConst.builtin = true;
defineWpConfigConst.multiple = true;
defineWpConfigConst.vars = [
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
