import type { StepFunction, JetpackOfflineModeStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const jetpackOfflineMode: StepFunction<JetpackOfflineModeStep> = (step: JetpackOfflineModeStep): StepResult => {
	const jetpackModules: string[] = [];
	if (step.vars?.blocks) {
		jetpackModules.push('blocks');
	}
	if (step.vars?.subscriptions) {
		jetpackModules.push('subscriptions');
	}

	const constants = {
		"JETACK_DEBUG": "true",
		"JETPACK_DEV_DEBUG": "true",
		"DNS_NS": 0
	};

	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				steps: [
					{
						"step": "defineWpConfigConsts",
						"consts": constants
					},
					{
						"step": "setSiteOptions",
						"options": {
							jetpack_active_modules: jetpackModules
						}
					}
				]
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				constants: constants,
				siteOptions: {
					jetpack_active_modules: jetpackModules
				}
			};
			return result;
		}
	};
};

jetpackOfflineMode.description = "Start Jetpack in Offline mode.";
jetpackOfflineMode.vars = [
	{
		name: "blocks",
		description: "Activate the Jetpack Blocks module.",
		type: "boolean",
		samples: ["true", "false"]
	},
	{
		name: "subscriptions",
		description: "Activate the Jetpack Subscriptions module.",
		type: "boolean",
		samples: ["true", "false"]
	}
];