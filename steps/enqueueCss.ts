import type { StepFunction, EnqueueCssStep, StepResult } from './types.js';
import { muPlugin } from './muPlugin.js';
import type { StepDefinition } from '@wp-playground/blueprints';

export const enqueueCss: StepFunction<EnqueueCssStep> = (step: EnqueueCssStep): StepResult => {
	const filename = step.vars?.filename || `custom-styles-${step.stepIndex || 0}`;
	const sanitizedFilename = filename.replace(/\.css$/, '');
	const cssFilePath = `/wordpress/wp-content/mu-plugins/${sanitizedFilename}.css`;

	const frontend = step.vars?.frontend !== false;
	const wpAdmin = step.vars?.wpAdmin !== false;

	let phpCode = '';
	if (frontend) {
		phpCode += `add_action( 'wp_enqueue_scripts', function() {
	wp_enqueue_style( '${sanitizedFilename}', WPMU_PLUGIN_URL . '/${sanitizedFilename}.css', array(), '1.0' );
} );

`;
	}

	if (wpAdmin) {
		phpCode += `add_action( 'admin_enqueue_scripts', function() {
	wp_enqueue_style( '${sanitizedFilename}', WPMU_PLUGIN_URL . '/${sanitizedFilename}.css', array(), '1.0' );
} );
`;
	}

	const muPluginResult = muPlugin({
		step: 'muPlugin',
		name: `enqueue-${sanitizedFilename}`,
		code: phpCode
	});

	return {
		toV1() {
			if (!step.vars?.css || !step.vars?.css.trim() || (!frontend && !wpAdmin)) {
				return { steps: [] };
			}

			const muSteps = muPluginResult.toV1();

			return {
				steps: [
					{
						step: 'writeFile',
						path: cssFilePath,
						data: step.vars?.css
					},
					...(muSteps.steps || [])
				]
			};
		},

		toV2() {
			if (!step.vars?.css || !step.vars?.css.trim() || (!frontend && !wpAdmin)) {
				return { version: 2 };
			}

			const muV2 = muPluginResult.toV2();

			return {
				version: 2,
				muPlugins: [
					...(muV2.muPlugins || []),
					{
						file: {
							filename: `${sanitizedFilename}.css`,
							content: step.vars?.css
						}
					}
				]
			};
		}
	};
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
		samples: [ '', 'body { background: #f0f0f0; }' ]
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
