import type { StepFunction, DebugStep, StepResult, CompilationContext } from './types.js';
import { v1ToV2Fallback } from './types.js';
import { installPlugin } from './installPlugin.js';
import type { StepDefinition, BlueprintV2Declaration } from '@wp-playground/blueprints';

export const debug: StepFunction<DebugStep> = ( step: DebugStep, context?: CompilationContext ): StepResult => {
	return {
		toV1() {
			const wpDebug = step.vars?.wpDebug !== false;
			const wpDebugDisplay = step.vars?.wpDebugDisplay !== false;
			const scriptDebug = step.vars?.scriptDebug === true;
			const queryMonitor = step.vars?.queryMonitor !== false;

			const steps: StepDefinition[] = [];

			const consts: Record<string, string | boolean> = {
				WP_DEBUG: wpDebug
			};

			if ( wpDebug ) {
				consts.WP_DEBUG_DISPLAY = wpDebugDisplay;
			}

			if ( scriptDebug ) {
				consts.SCRIPT_DEBUG = true;
			}

			steps.push( { step: 'defineWpConfigConsts', consts: consts } );

			if ( queryMonitor ) {
				const hasQueryMonitorPlugin = context?.hasStep( 'installPlugin', { url: 'query-monitor' } ) ?? false;
				if ( !hasQueryMonitorPlugin ) {
					const qmResult = installPlugin( { step: 'installPlugin', vars: { url: 'query-monitor' } } ).toV1();
					if ( qmResult.steps ) {
						const qmSteps = qmResult.steps.filter( ( s ): s is StepDefinition => !!s && typeof s === 'object' );
						steps.push( ...qmSteps );
					}
				}
			}

			return { steps };
		},

		toV2(): BlueprintV2Declaration {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

debug.description = "Configure WordPress debug settings and optionally install Query Monitor plugin.";
debug.vars = [
	{
		name: "wpDebug",
		description: "Enable WordPress debug mode",
		type: "boolean",
		required: false
	},
	{
		name: "wpDebugDisplay",
		description: "Display errors in HTML output. Only applies when the above is enabled.",
		type: "boolean",
		required: false,
		show: (step: DebugStep) => step.vars?.wpDebug !== false
	},
	{
		name: "scriptDebug",
		description: "Use non-minified JavaScript and CSS files.",
		type: "boolean",
		required: false
	},
	{
		name: "queryMonitor",
		description: "Install Query Monitor plugin.",
		type: "boolean",
		required: false
	}
];
