import type { StepFunction, InstallPhpLiteAdminStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';

const adminBarCode = `<?php
add_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {
        $wp_menu->add_node(
                array(
                        'id'     => 'phpliteadmin',
                        'title'  => 'phpliteadmin',
                        'href'   => '/phpliteadmin.php',
                )
        );
}, 100 );`;

const configCode = `<?php

$databases = array(
	array(
		'path'=> '/wordpress/wp-content/database/.ht.sqlite',
		'name'=> 'WordPress'
	),
);
$directory = false;
`;

export const installPhpLiteAdmin: StepFunction<InstallPhpLiteAdminStep> = (step: InstallPhpLiteAdminStep): StepResult => {
	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				steps: [
					{
						step: "mkdir",
						path: "/wordpress/wp-content/mu-plugins",
					},
					{
						step: "writeFile",
						path: "/wordpress/wp-content/mu-plugins/phpliteadmin.php",
						data: adminBarCode
					},
					{
						step: "writeFile",
						path: "/wordpress/phpliteadmin.config.php",
						data: configCode
					},
					{
						step: "writeFile",
						path: "/wordpress/phpliteadmin.php",
						data: {
							resource: "url",
							url: "https://gist.githubusercontent.com/akirk/c88d7e5f4a0e93c07b437b43fc62ac0c/raw/879692a465c5393cfceaa03dcdf16fef4edea108/phpliteadmin.php"
						}
					}
				]
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				muPlugins: [
					{
						file: {
							filename: "phpliteadmin.php",
							content: adminBarCode
						}
					}
				],
				steps: [
					{
						step: "writeFile",
						path: "/wordpress/phpliteadmin.config.php",
						data: configCode
					},
					{
						step: "writeFile",
						path: "/wordpress/phpliteadmin.php",
						data: {
							resource: "url",
							url: "https://gist.githubusercontent.com/akirk/c88d7e5f4a0e93c07b437b43fc62ac0c/raw/879692a465c5393cfceaa03dcdf16fef4edea108/phpliteadmin.php"
						}
					}
				]
			};
			return result;
		}
	};
};

installPhpLiteAdmin.description = "Provide phpLiteAdmin. Password: admin";
installPhpLiteAdmin.vars = [];