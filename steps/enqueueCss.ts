import type { StepFunction, EnqueueCssStep } from './types.js';

export const enqueueCss: StepFunction<EnqueueCssStep> = (step: EnqueueCssStep) => {
	if (!step.css || !step.css.trim()) {
		return [];
	}

	const frontend = step.frontend !== false;
	const wpAdmin = step.wpAdmin !== false;

	if (!frontend && !wpAdmin) {
		return [];
	}

	const filename = step.filename || `custom-styles-${step.stepIndex || 0}`;
	const sanitizedFilename = filename.replace(/\.css$/, '');
	const cssFilePath = `/wordpress/wp-content/uploads/${sanitizedFilename}.css`;

	let phpCode = `<?php
/**
 * Plugin Name: Enqueue Custom CSS - ${sanitizedFilename}
 */
`;

	if (frontend) {
		phpCode += `add_action( 'wp_enqueue_scripts', function() {
	wp_enqueue_style( '${sanitizedFilename}', content_url( 'uploads/${sanitizedFilename}.css' ), array(), '1.0' );
} );

`;
	}

	if (wpAdmin) {
		phpCode += `add_action( 'admin_enqueue_scripts', function() {
	wp_enqueue_style( '${sanitizedFilename}', content_url( 'uploads/${sanitizedFilename}.css' ), array(), '1.0' );
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
			"path": cssFilePath,
			"data": step.css || ''
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
};

enqueueCss.description = "Enqueue custom CSS on frontend and/or admin.";
enqueueCss.vars = [
	{
		name: "filename",
		description: "Filename for the CSS file (without .css extension)",
		type: "text",
		required: false,
		samples: [ 'custom-styles', 'theme-overrides' ]
	},
	{
		name: "css",
		description: "CSS code to enqueue",
		type: "textarea",
		language: "css",
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
