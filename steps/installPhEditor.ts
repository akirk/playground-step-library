import type { StepFunction, InstallPhEditorStep } from './types.js';

export const installPhEditor: StepFunction<InstallPhEditorStep> = (step: InstallPhEditorStep) => {
	const steps = [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/phEditor.php",
			"data": `<?php
add_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {
        $wp_menu->add_node(
                array(
                        'id'     => 'pheditor',
                        'title'  => 'phEditor',
                        'href'   => '/pheditor-main/pheditor.php',
                )
        );
}, 100 );`
		},
		{
			"step": "unzip",
			"zipFile": {
				"resource": "git:directory",
				"url": "https://github.com/akirk/pheditor",
				"ref": "HEAD"
			},
			"extractToPath": "/wordpress/"
		}
	];
	(steps as any).landingPage = "/pheditor-main/pheditor.php";
	return steps;
};

installPhEditor.description = "Install phEditor. Password: admin";
installPhEditor.vars = [];