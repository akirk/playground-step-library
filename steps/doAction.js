customSteps.doAction = function ( step ) {
	if ( !step?.vars?.action ) {
		return [];
	}
	const params = [ '' ];
	for ( let i = 1; i <= 5; i++ ) {
		if ( step.vars[ "parameter" + i ] ) {
			params.push( "'" + step.vars[ "parameter" + i ] + "'" );
		}
	}
	return [
		{
			"step": "runPHP",
			"code": "<?php do_action( '" + step.vars.action + "'" + params.join( ',' ) + " ); ?>"
		}
	];
};
customSteps.doAction.description = "Execute a custom action.";
customSteps.doAction.vars = [
	{
		"name": "action",
		"description": "Execute a custom action.",
		"type": "text",
		"required": true,
		"samples": [ "" ]
	},
	{
		"name": "parameter1",
		"description": "First parameter for the action.",
		"type": "text",
		"required": false,
		"samples": [ "" ]
	},
	{
		"name": "parameter2",
		"description": "Second parameter for the action.",
		"type": "text",
		"required": false,
		"samples": [ "" ]
	},
	{
		"name": "parameter3",
		"description": "Third parameter for the action.",
		"type": "text",
		"required": false,
		"samples": [ "" ]
	},
	{
		"name": "parameter4",
		"description": "Fourth parameter for the action.",
		"type": "text",
		"required": false,
		"samples": [ "" ]
	},
	{
		"name": "parameter5",
		"description": "Fifth parameter for the action.",
		"type": "text",
		"required": false,
		"samples": [ "" ]
	}
];
