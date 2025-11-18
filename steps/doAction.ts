import type { StepFunction, DoActionStep} from './types.js';


export const doAction: StepFunction<DoActionStep> = (step: DoActionStep) => {
	if ( !step?.action ) {
		return [];
	}
	const params = [ '' ];
	for ( let i = 1; i <= 5; i++ ) {
		const paramKey = `parameter${i}` as keyof DoActionStep;
		if ( step[paramKey] ) {
			params.push( "'" + step[paramKey] + "'" );
		}
	}
	return [
		{
			"step": "runPHP",
			"code": "<?php do_action( '" + step.action + "'" + params.join( ',' ) + " ); ?>",
			"progress": {
				"caption": `doAction: ${step.action}`
			}
		}
	];
};

doAction.description = "Execute a custom action.";
doAction.vars = [
	{
		name: "action",
		description: "Execute a custom action.",
		type: "text",
		required: true,
		samples: [ "" ]
	},
	{
		name: "parameter1",
		description: "First parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	{
		name: "parameter2",
		description: "Second parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	{
		name: "parameter3",
		description: "Third parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	{
		name: "parameter4",
		description: "Fourth parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	{
		name: "parameter5",
		description: "Fifth parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	}
];