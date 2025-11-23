import type { StepFunction, EnqueueJsStep, StepResult } from './types.js';
import { muPlugin } from './muPlugin.js';
import type { StepDefinition } from '@wp-playground/blueprints';

export const enqueueJs: StepFunction<EnqueueJsStep> = (step: EnqueueJsStep): StepResult => {
	const filename = step.vars?.filename || `custom-script-${step.stepIndex || 0}`;
	const sanitizedFilename = filename.replace(/\.js$/, '');
	const jsFilePath = `/wordpress/wp-content/mu-plugins/${sanitizedFilename}.js`;

	const frontend = step.vars?.frontend !== false;
	const wpAdmin = step.vars?.wpAdmin !== false;

	let phpCode = '';
	if (frontend) {
		phpCode += `add_action( 'wp_enqueue_scripts', function() {
	wp_enqueue_script( '${sanitizedFilename}', WPMU_PLUGIN_URL . '/${sanitizedFilename}.js', array(), '1.0', true );
} );

`;
	}

	if (wpAdmin) {
		phpCode += `add_action( 'admin_enqueue_scripts', function() {
	wp_enqueue_script( '${sanitizedFilename}', WPMU_PLUGIN_URL . '/${sanitizedFilename}.js', array(), '1.0', true );
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
			if (!step.vars?.js || !step.vars?.js.trim() || (!frontend && !wpAdmin)) {
				return { steps: [] };
			}

			const muSteps = muPluginResult.toV1();

			return {
				steps: [
					{
						step: 'writeFile',
						path: jsFilePath,
						data: step.vars?.js
					},
					...(muSteps.steps || [])
				]
			};
		},

		toV2() {
			if (!step.vars?.js || !step.vars?.js.trim() || (!frontend && !wpAdmin)) {
				return { version: 2 };
			}

			const muV2 = muPluginResult.toV2();

			return {
				version: 2,
				muPlugins: [
					...(muV2.muPlugins || []),
					{
						file: {
							filename: `${sanitizedFilename}.js`,
							content: step.vars?.js
						}
					}
				]
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
