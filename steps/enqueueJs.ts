import type { StepFunction, EnqueueJsStep , StepResult, V2SchemaFragments } from './types.js';

export const enqueueJs: StepFunction<EnqueueJsStep> = (step: EnqueueJsStep): StepResult => {
	return {
		toV1() {
	if (!step.js || !step.js.trim()) {
		return [];
	}

	const frontend = step.frontend !== false;
	const wpAdmin = step.wpAdmin !== false;

	if (!frontend && !wpAdmin) {
		return [];
	}

	const filename = step.filename || `custom-script-${step.stepIndex || 0}`;
	const sanitizedFilename = filename.replace(/\.js$/, '');
	const jsFilePath = `/wordpress/wp-content/uploads/${sanitizedFilename}.js`;

	let phpCode = `<?php
/**
 * Plugin Name: Enqueue Custom JS - ${sanitizedFilename}
 */
`;

	if (frontend) {
		phpCode += `add_action( 'wp_enqueue_scripts', function() {
	wp_enqueue_script( '${sanitizedFilename}', content_url( 'uploads/${sanitizedFilename}.js' ), array(), '1.0', true );
} );

`;
	}

	if (wpAdmin) {
		phpCode += `add_action( 'admin_enqueue_scripts', function() {
	wp_enqueue_script( '${sanitizedFilename}', content_url( 'uploads/${sanitizedFilename}.js' ), array(), '1.0', true );
} );
`;
	}

	return [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/uploads",
		},
		{
			"step": "writeFile",
			"path": jsFilePath,
			"data": step.js || ''
		},
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": `/wordpress/wp-content/mu-plugins/enqueue-${sanitizedFilename}-${step.stepIndex || 0}.php`,
			"data": phpCode
		}
	];
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
			};
		}
	};
};

enqueueJs.description = "Enqueue custom JavaScript on frontend and/or admin.";
enqueueJs.vars = [
	{
		name: "filename",
		description: "Filename for the JavaScript file (without .js extension)",
		type: "text",
		required: false,
		samples: [ 'custom-script', 'interactive-features' ]
	},
	{
		name: "js",
		description: "JavaScript code to enqueue",
		type: "textarea",
		language: "javascript",
		required: true,
		samples: [ '' ]
	},
	{
		name: "frontend",
		description: "Enqueue on frontend",
		type: "boolean",
		samples: [ "true" ]
	},
	{
		name: "wpAdmin",
		description: "Enqueue in wp-admin",
		type: "boolean",
		samples: [ "true" ]
	}
];
