export function setSiteOption( step ) {
	if ( ! step.vars.name ) {
		return [];
	}
	const optionStep = {
		"step": "setSiteOptions",
		"options": {}
	};
	if ( Array.isArray( step.vars.name ) ) {
		step.vars.name.forEach( ( name, index ) => {
			if ( ! name ) {
				return;
			}
			optionStep.options[name] = step.vars.value[index];
		} );
	} else {
		optionStep.options[step.vars.name] = step.vars.value;
	}
	return [ optionStep ];
};
setSiteOption.description = "Set a site option.";
setSiteOption.builtin = true;
setSiteOption.multiple = true;
setSiteOption.vars = [
	{
		"name": "name",
		"description": "Option name",
		"samples": [ "","permalink_structure" ]
	},
	{
		"name": "value",
		"description": "Option value",
		"samples": [ "", "/%postname%/" ]
	}
];
