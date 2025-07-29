customSteps.addCorsProxy = function( step ) {
	let code = `<?php add_action( 'requests-requests.before_request', function( &$url ) {
$url = 'https://playground.wordpress.net/cors-proxy.php?' . $url;
} );
`;
	const steps = [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/addFilter-${stepIndex}.php",
			"data": code
		}
	];
	steps.features = {
		networking: true
	};

	return steps;
};
customSteps.addCorsProxy.info = "Automatically add the CORS proxy to outgoing HTTP requests.";
