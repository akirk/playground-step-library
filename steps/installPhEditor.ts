import type { StepFunction, InstallPhEditorStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';

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
						} as any,
						extractToPath: "/wordpress/"
					}
				]
			};
			return result;
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

installPhEditor.description = "Install phEditor. Password: admin";
installPhEditor.vars = [];