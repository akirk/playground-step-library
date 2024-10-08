customSteps.installPhEditor = function( step ) {
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
				"resource": "url",
				"url": "https://github-proxy.com/proxy/?repo=akirk/pheditor&branch=main",
			},
			"extractToPath": "/wordpress/"
		}
	];
	steps.landingPage = "/pheditor-main/pheditor.php";
	return steps;
};
customSteps.installPhEditor.info = "Install phEditor. Password: admin";
