import type { StepFunction, InstallPhEditorStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';

const adminBarCode = `<?php
add_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {
        $wp_menu->add_node(
                array(
                        'id'     => 'pheditor',
                        'title'  => 'phEditor',
                        'href'   => '/pheditor-main/pheditor.php',
                )
        );
}, 100 );`;

export const installPhEditor: StepFunction<InstallPhEditorStep> = (step: InstallPhEditorStep): StepResult => {
	return {
		toV1() {
			const result: BlueprintV1Declaration = {
				landingPage: "/pheditor-main/pheditor.php",
				steps: [
					{
						step: "mkdir",
						path: "/wordpress/wp-content/mu-plugins",
					},
					{
						step: "writeFile",
						path: "/wordpress/wp-content/mu-plugins/phEditor.php",
						data: adminBarCode
					},
					{
						step: "unzip",
						zipFile: {
							resource: "git:directory",
							url: "https://github.com/akirk/pheditor",
							ref: "HEAD"
						},
						extractToPath: "/wordpress/"
					}
				]
			};
			return result;
		},

		toV2() {
			const result: BlueprintV2Declaration = {
				version: 2,
				landingPage: "/pheditor-main/pheditor.php",
				muPlugins: [
					{
						file: {
							filename: "phEditor.php",
							content: adminBarCode
						}
					}
				],
				steps: [
					{
						step: "unzip",
						zipFile: {
							resource: "git:directory",
							url: "https://github.com/akirk/pheditor",
							ref: "HEAD"
						},
						extractToPath: "/wordpress/"
					}
				]
			};
			return result;
		}
	};
};

installPhEditor.description = "Install phEditor. Password: admin";
installPhEditor.vars = [];