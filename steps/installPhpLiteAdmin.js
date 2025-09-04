customSteps.installPhpLiteAdmin = function( step ) {
	const steps = [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/phpliteadmin.php",
			"data": `<?php
add_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {
        $wp_menu->add_node(
                array(
                        'id'     => 'phpliteadmin',
                        'title'  => 'phpliteadmin',
                        'href'   => '/phpliteadmin.php',
                )
        );
}, 100 );`
		},
		{
			"step": "writeFile",
			"path": "/wordpress/phpliteadmin.config.php",
			"data": `<?php

$databases = array(
	array(
		'path'=> '/wordpress/wp-content/database/.ht.sqlite',
		'name'=> 'WordPress'
	),
);
$directory = false;
`
		},
		{
			"step": "writeFile",
			"path": "/wordpress/phpliteadmin.php",
			"data": {
				"resource": "url",
				"url": "https://gist.githubusercontent.com/akirk/c88d7e5f4a0e93c07b437b43fc62ac0c/raw/879692a465c5393cfceaa03dcdf16fef4edea108/phpliteadmin.php"
			}
		}
	];
	steps.landingPage = "/phpliteadmin.php";
	return steps;
};
customSteps.installPhpLiteAdmin.description = "Provide phpLiteAdmin. Password: admin";
