customSteps.jetpackOfflineMode = function( step, blueprint ) {
	let jetpack_active_modules = [];
	if ( step.vars.blocks ) {
		jetpack_active_modules.push( 'blocks' );
	}
	if ( step.vars.subscriptions ) {
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
	for ( const i in blueprint.steps ) {
		if ( blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'jetpack' ) {
			hasJetpackPlugin = true;
		}
	}
	if ( ! hasJetpackPlugin ) {
		steps = customSteps.installPlugin( { vars: { url: 'jetpack'}} ).concat( steps );
	}
	return steps;
};
customSteps.jetpackOfflineMode.description = "Start Jetpack in Offline mode.";
customSteps.jetpackOfflineMode.vars = [
	{
		"name": "blocks",
		"description": "Activate the Jetpack Blocks module.",
		"type": "boolean",
		"samples": [ "true", "false" ]
	},
	{
		"name": "subscriptions",
		"description": "Activate the Jetpack Subscriptions module.",
		"type": "boolean",
		"samples": [ "true", "false" ]
	}
];
