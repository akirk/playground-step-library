import type { StepFunction, AddFilterStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const addFilter: StepFunction<AddFilterStep> = (step: AddFilterStep) => {
	let code = "<?php add_filter( '" + step.filter + "', ";
	// Automatically put code in a function if it is not already.
	const codeText = step.code || '';
	if ( codeText.match( /^function\s*\(/i ) ) {
		code += codeText;
	} else if (
		codeText.match( /[(;]/ ) ||
		( codeText.match( / / ) && ! codeText.match( /^['"].*['"]$/i ) )
	) {
	 	code += 'function() { ' + codeText.replace( /[\s;]+$/, '', ) + '; }';
	 } else {
		code += codeText;
	 }
	// if the step.code is a php function get the number of arguments
	// and add them to the add_filter call
	let m = code.match( /function\s*\((.*?)\)/i );
	if ( m && m[1] ) {
		let args = m[1].split( ',' ).length;
		if ( args > 1 ) {
			if ( step.priority && step.priority > 0 ) {
				code += ", " + step.priority;
			} else {
				code += ", 10";
			}
			code += ", " + args;
		} else if ( step.priority && step.priority > 0 && step.priority != 10 ) {
			code += ", " + step.priority;
		}
	} else if ( step.priority && step.priority > 0 && step.priority != 10 ) {
		code += ", " + step.priority;
	}
	code += " );";
	return [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": `/wordpress/wp-content/mu-plugins/addFilter-${step.stepIndex || 0}.php`,
			"data": code
		}
	];
};

addFilter.description = "Easily add a filtered value.";
addFilter.vars = createVarsConfig({
	filter: {
		description: "Name of the filter",
		required: true,
		samples: [ "init" ]
	},
	code: {
		description: "Code for the filter",
		type: "textarea",
		required: true,
		samples: [ "'__return_false'", "'__return_true'", "function ( $a, $b ) {\nreturn $a;\n}" ]
	},
	priority: {
		description: "Priority of the filter",
		required: false,
		samples: [ "10" ]
	}
});