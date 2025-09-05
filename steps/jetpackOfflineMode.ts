import { installPlugin } from './installPlugin.js';
import type { StepFunction, JetpackOfflineModeStep} from './types.js';


export const jetpackOfflineMode: StepFunction<JetpackOfflineModeStep> = (step: JetpackOfflineModeStep, blueprint?: any) => {
	let jetpack_active_modules = [];
	if ( step.blocks ) {
		jetpack_active_modules.push( 'blocks' );
	}
	if ( step.subscriptions ) {
		jetpack_active_modules.push( 'subscriptions' );
	}

	let steps = [
		{
			"step": "defineWpConfigConsts",
			"consts": {
				"JETACK_DEBUG": "true",
				"JETPACK_DEV_DEBUG": "true",
				"DNS_NS": 0
			}
		},
		{
			"step": "setSiteOptions",
			"options": {
				jetpack_active_modules
			}
		}
	];
	let hasJetpackPlugin = false;
	if (blueprint) {
		for ( const i in blueprint.steps ) {
			if ( blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.url === 'jetpack' ) {
				hasJetpackPlugin = true;
			}
		}
	}
	if ( ! hasJetpackPlugin ) {
		const installJetpackSteps = installPlugin({ step: 'installPlugin', url: 'jetpack'});
		steps = installJetpackSteps.concat( steps );
	}
	return steps;
};

jetpackOfflineMode.description = "Start Jetpack in Offline mode.";
jetpackOfflineMode.vars = Object.entries({
	blocks: {
		description: "Activate the Jetpack Blocks module.",
		type: "boolean",
		samples: [ "true", "false" ]
	},
	subscriptions: {
		description: "Activate the Jetpack Subscriptions module.",
		type: "boolean",
		samples: [ "true", "false" ]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));