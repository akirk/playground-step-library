/** @type {import("eslint").Linter.Config} */
module.exports = {
	rules: {
		'indent': [ 'error', 'tab', { SwitchCase: 1 } ], // Use tabs for indentation
		'quotes': [ 'error', 'single' ], // Use single quotes
		'semi': [ 'error', 'always' ], // Require semicolons
		'no-unused-vars': [ 'warn' ], // Warn on unused variables
		'array-bracket-spacing': [ 'error', 'always' ], // Spaces within array brackets
		'object-curly-spacing': [ 'error', 'always' ], // Spaces within object braces
		'key-spacing': [ 'error', { beforeColon: false, afterColon: true } ], // Space after colons in object keys
		'comma-spacing': [ 'error', { before: false, after: true } ], // Space after commas
		'space-in-parens': [ 'error', 'always' ], // Spaces within parentheses
		'space-before-blocks': [ 'error', 'always' ], // Space before blocks
	},
};
