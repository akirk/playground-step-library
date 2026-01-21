import type { StepFunction, BlueprintStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export interface ActivatePluginStep extends BlueprintStep {
	pluginPath: string;
	pluginName?: string;
}

export const activatePlugin: StepFunction<ActivatePluginStep> = ( step: ActivatePluginStep ): StepResult => {
	return {
		toV1() {
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

activatePlugin.description = 'Path to the plugin directory as absolute path.';
activatePlugin.hidden = true;
activatePlugin.vars = [
	{
		name: 'pluginPath',
		description: 'Path to the plugin directory as absolute path',
		required: true,
	},
	{
		name: 'pluginName',
	}
];
