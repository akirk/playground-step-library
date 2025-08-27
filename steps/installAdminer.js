customSteps.installAdminer = function( step ) {
	const steps = [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/adminer-link.php",
			"data": `<?php
add_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {
    $wp_menu->add_node(
            array(
                    'id'     => 'adminer',
                    'title'  => 'Adminer',
                    'href'   => '/adminer/?sqlite=&username=&db=%2Fwordpress%2Fwp-content%2Fdatabase%2F.ht.sqlite',
            )
);
}, 100 );`
		},
		{
			"step": "mkdir",
			"path": "/wordpress/adminer",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/adminer/index.php",
			"data": `<?php
function adminer_object() {
    class AdminerLoginPasswordLess extends Adminer\Plugin {
        function login( $login, $password ) {
            return true;
        }
    }
    return new Adminer\Plugins( array( new AdminerLoginPasswordLess() ) );
}
require '/wordpress/adminer/adminer.php';`
		},
		{
			"step": "writeFile",
			"path": "/wordpress/adminer/adminer.php",
			"data": {
				"resource": "url",
				"url": "https://github.com/vrana/adminer/releases/download/v5.3.0/adminer-5.3.0-en.php"
			}
		}
	];
	steps.landingPage = "/adminer/?sqlite=&username=&db=%2Fwordpress%2Fwp-content%2Fdatabase%2F.ht.sqlite";
	return steps;
};
customSteps.installPhpLiteAdmin.info = "Install Adminer with auto login link.";
