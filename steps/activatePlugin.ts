import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

export interface ActivatePluginStep extends BlueprintStep {
	pluginPath: string;
	pluginName?: string;
}

export const activatePlugin: StepFunction<ActivatePluginStep> = ( step: ActivatePluginStep ): StepResult => {
	return {
		toV1(): BlueprintV1Declaration {
			return {
				steps: [
					{
						step: 'activatePlugin',
						pluginPath: step.pluginPath,
						pluginName: step.pluginName
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

activatePlugin.description = 'Activate an already installed plugin.';
activatePlugin.hidden = true;
activatePlugin.vars = [
	{
		name: 'pluginPath',
		description: 'Path to the plugin file relative to wp-content/plugins/',
		required: true
	},
	{
		name: 'pluginName',
		description: 'Human-readable plugin name for progress display'
	}
];
