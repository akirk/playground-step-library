import type { StepFunction, AddFilterStep, StepResult } from './types.js';
import { muPlugin } from './muPlugin.js';

export const addFilter: StepFunction<AddFilterStep> = (step: AddFilterStep): StepResult => {
	let code = "add_filter( '" + step.vars?.filter + "', ";
	// Automatically put code in a function if it is not already.
	const codeText = step.vars?.code || '';
	if (codeText.match(/^function\s*\(/i)) {
		code += codeText;
	} else if (
		codeText.match(/[(;]/) ||
		(codeText.match(/ /) && !codeText.match(/^['"].*['"]$/i))
	) {
		code += 'function() { ' + codeText.replace(/[\s;]+$/, '',) + '; }';
	} else {
		code += codeText;
	}
	// if the step.vars?.code is a php function get the number of arguments
	// and add them to the add_filter call
	let m = code.match(/function\s*\((.*?)\)/i);
	if (m && m[1]) {
		let args = m[1].split(',').length;
		if (args > 1) {
			if (step.vars?.priority && step.vars?.priority > 0) {
				code += ", " + step.vars?.priority;
			} else {
				code += ", 10";
			}
			code += ", " + args;
		} else if (step.vars?.priority && step.vars?.priority > 0 && step.vars?.priority != 10) {
			code += ", " + step.vars?.priority;
		}
	} else if (step.vars?.priority && step.vars?.priority > 0 && step.vars?.priority != 10) {
		code += ", " + step.vars?.priority;
	}
	code += " );";

	return muPlugin({
		step: 'muPlugin',
		name: `addFilter-${step.stepIndex || 0}`,
		code
	});
};

addFilter.description = "Easily add a filtered value.";
addFilter.vars = [
	{
		name: "filter",
		description: "Name of the filter",
		required: true,
		samples: ["init"]
	},
	{
		name: "code",
		description: "Code for the filter",
		type: "textarea",
		language: "php",
		required: true,
		samples: ["'__return_false'", "'__return_true'", "function ( $a, $b ) {\nreturn $a;\n}"]
	},
	{
		name: "priority",
		description: "Priority of the filter",
		required: false,
		samples: ["10"]
	}
];