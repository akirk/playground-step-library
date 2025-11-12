import type { StepFunction, DebugStep } from './types.js';
import { installPlugin } from './installPlugin.js';

export const debug: StepFunction<DebugStep> = (step: DebugStep, blueprint: any) => {
	const wpDebug = step.wpDebug !== false;
	const wpDebugDisplay = step.wpDebugDisplay !== false;
	const scriptDebug = step.scriptDebug === true;
	const queryMonitor = step.queryMonitor !== false;

	const steps: any[] = [];

	const consts: Record<string, string | boolean> = {
		WP_DEBUG: wpDebug
	};

	if (wpDebug) {
		consts.WP_DEBUG_DISPLAY = wpDebugDisplay;
	}

	if (scriptDebug) {
		consts.SCRIPT_DEBUG = true;
	}

	steps.push({
		step: 'defineWpConfigConsts',
		consts: consts
	});

	if (queryMonitor) {
		let hasQueryMonitorPlugin = false;
		for (const i in blueprint.steps) {
			if (blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'query-monitor') {
				hasQueryMonitorPlugin = true;
			}
		}
		if (!hasQueryMonitorPlugin) {
			const queryMonitorSteps = installPlugin({ step: 'installPlugin', url: 'query-monitor' });
			// Add caption to show debug step is installing Query Monitor
			if (queryMonitorSteps.length > 0 && queryMonitorSteps[0].step === 'installPlugin') {
				queryMonitorSteps[0].progress = {
					caption: 'debug: Installing Query Monitor'
				};
			}
			steps.push(...queryMonitorSteps);
		}
	}

	return steps;
};

debug.description = "Configure WordPress debug settings and optionally install Query Monitor plugin.";
debug.vars = Object.entries({
	wpDebug: {
		description: "Enable WordPress debug mode",
		type: "boolean",
		required: false
	},
	wpDebugDisplay: {
		description: "Display errors in HTML output. Only applies when the above is enabled.",
		type: "boolean",
		required: false,
		show: (step: DebugStep) => step.wpDebug !== false
	},
	scriptDebug: {
		description: "Use non-minified JavaScript and CSS files.",
		type: "boolean",
		required: false
	},
	queryMonitor: {
		description: "Install Query Monitor plugin.",
		type: "boolean",
		required: false
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));
