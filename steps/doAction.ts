import type { StepFunction, DoActionStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

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
			"code": "<?php do_action( '" + step.action + "'" + params.join( ',' ) + " ); ?>"
		}
	];
};

doAction.description = "Execute a custom action.";
doAction.vars = createVarsConfig({
	action: {
		description: "Execute a custom action.",
		type: "text",
		required: true,
		samples: [ "" ]
	},
	parameter1: {
		description: "First parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	parameter2: {
		description: "Second parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	parameter3: {
		description: "Third parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	parameter4: {
		description: "Fourth parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	},
	parameter5: {
		description: "Fifth parameter for the action.",
		type: "text",
		required: false,
		samples: [ "" ]
	}
});