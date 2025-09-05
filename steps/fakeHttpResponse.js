export function fakeHttpResponse( step, blueprint ) {
	const steps = [];

	if ( step.vars.url ) {
		const url = step.vars.url.toLowerCase().replace( /[^a-z0-9-_]+/gi, '-' ).replace( /-+$/g, '' );
		steps.push( {
			"step": "writeFile",
			"path": `wordpress/wp-content/mu-plugins/fake-http-response/${url}.txt`,
			"data": step.vars.response
		} );
	}
	let hasFakeHttpResponsePlugin = false;
	const fakeHttpResponsePluginPath = 'wordpress/wp-content/mu-plugins/fake-http-response.php';
	for ( const i in blueprint.steps ) {
		if ( blueprint.steps[i].step === 'writeFile' && blueprint.steps[i].path === fakeHttpResponsePluginPath ) {
			hasFakeHttpResponsePlugin = true;
			break;
		}
	}
	if ( ! hasFakeHttpResponsePlugin ) {
		steps.unshift( {
			"step": "writeFile",
			"path": fakeHttpResponsePluginPath,
			"data": `<?php
add_filter(
	'pre_http_request',
	function ( $preempt, $request, $url ) {
		$filename = __DIR__ . '/fake-http-response/' . rtrim( preg_replace( '/[^a-z0-9-_]+/i', '-', $url ), '-' ) . '.txt';
		if ( file_exists( $filename ) ) {
			$content = file_get_contents( $filename );
			$content_type = substr( $content, 0, 1 ) === '<' ? 'text/html' : 'application/json';
			return array(
				'headers'  => array(
					'content-type' => $content_type,
				),
				'body'     => $content,
				'response' => array(
					'code' => 200,
				),
			);
		}
		error_log( 'Not faked: ' . $url );
		return $preempt;
	},
	10,
	3
);`
		} );

		steps.unshift( {
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins/fake-http-response",
		} );
	}
	return steps;
};
fakeHttpResponse.description = "Fake a wp_remote_request() response.";
fakeHttpResponse.vars = [
	{
		"name": "url",
		"description": "URL like https://wordpress.org/",
		"type": "url",
		"samples": [ "" ]
	},
	{
		"name": "response",
		"description": "The data to return",
		"type": "textarea",
		"samples": [ "hello world" ]
	}
];
