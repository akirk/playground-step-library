customSteps.setSiteOption = function( step ) {
	const optionStep = {
		"step": "setSiteOptions",
		"options": {}
	};
	optionStep.options[step.vars.name] = step.vars.value;
	return [ optionStep ];
};
customSteps.setSiteOption.info = "Set a site option.";
customSteps.setSiteOption.builtin = true;
customSteps.setSiteOption.vars = [
	{
		"name": "name",
		"description": "Option name",
		"samples": [ "hello" ]
	},
	{
		"name": "value",
		"description": "Option value",
		"samples": [ "world" ]
	}

];
