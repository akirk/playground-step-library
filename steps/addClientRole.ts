import type { StepFunction, AddClientRoleStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const addClientRole: StepFunction<AddClientRoleStep> = (step: AddClientRoleStep) => {
	return [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			// Adapted from https://github.com/felixarntz/felixarntz-mu-plugins/blob/main/felixarntz-mu-plugins/add-client-role.php
			"path": "/wordpress/wp-content/mu-plugins/add-client-role.php",
			"data": `<?php
add_action(
	'init',
	static function () {
		// The client role inherits all capabilities from the editor role.
		$editor_role = get_role( 'editor' );
		if ( ! $editor_role ) {
			return;
		}

		$display_name    = '${step?.displayName}';
		$additional_caps = array(
			'update_core',
			'update_plugins',
			'update_themes',
		);

		$capabilities = $editor_role->capabilities;

		// If an indexed array, transform it to a capabilities map with each capability granted.
		if ( isset( $additional_caps[0] ) ) {
			$additional_caps = array_fill_keys( $additional_caps, true );
		}
		foreach ( $additional_caps as $cap => $grant ) {
			// Do not allow removing capabilities.
			if ( isset( $capabilities[ $cap ] ) && $capabilities[ $cap ] ) {
				continue;
			}
			$capabilities[ $cap ] = $grant;
		}

		$roles = array(
			'client' => array(
				'display_name' => $display_name,
				'capabilities' => $capabilities,
			),
		);

		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize
		$roles_hash      = md5( serialize( $roles ) );
		$roles_installed = get_option( 'client_role_installed' );
		if ( $roles_installed !== $roles_hash ) {
			foreach ( $roles as $role => $data ) {
				remove_role( $role );
				add_role( $role, $data['display_name'], $data['capabilities'] );
			}
			update_option( 'client_role_installed', $roles_hash );
		}
	}
);
`
		}
	];
};

addClientRole.description = "Adds a role for clients with additional capabilities than editors, but not quite admin.";
addClientRole.vars = createVarsConfig({
	displayName: {
		description: "Display name for the client role",
		required: true,
		samples: [ "Client" ]
	}
});