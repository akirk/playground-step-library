import type { StepFunction, FakeHttpResponseStep, StepResult, CompilationContext } from './types.js';


export const fakeHttpResponse: StepFunction<FakeHttpResponseStep> = ( step: FakeHttpResponseStep, context?: CompilationContext ): StepResult => {
	return {
		toV1() {
			const steps: Array<{ step: "writeFile"; path: string; data: string } | { step: "mkdir"; path: string }> = [];

			if ( step.vars?.url ) {
				const url = step.vars?.url.toLowerCase().replace( /[^a-z0-9-_]+/gi, '-' ).replace( /-+$/g, '' );
				steps.push( {
					step: "writeFile" as const,
					path: `wordpress/wp-content/mu-plugins/fake-http-response/${url}.txt`,
					data: step.vars?.response || ''
				} );
			}
			const fakeHttpResponsePluginPath = 'wordpress/wp-content/mu-plugins/fake-http-response.php';
			const hasFakeHttpResponsePlugin = context?.hasStep( 'writeFile', { path: fakeHttpResponsePluginPath } ) ?? false;
			if ( !hasFakeHttpResponsePlugin ) {
				steps.unshift( {
					step: "writeFile" as const,
					path: fakeHttpResponsePluginPath,
					data: `<?php
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
					step: "mkdir" as const,
					path: "/wordpress/wp-content/mu-plugins/fake-http-response",
				} );
			}
			return { steps };
		},

		toV2() {
			if ( !step.vars?.url ) {
				return { version: 2 };
			}

			const url = step.vars?.url.toLowerCase().replace( /[^a-z0-9-_]+/gi, '-' ).replace( /-+$/g, '' );

			return {
				version: 2,
				muPlugins: [
					{
						filename: 'fake-http-response.php',
						content: `<?php
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
					},
					{
						filename: `fake-http-response/${url}.txt`,
						content: step.vars?.response || ''
					}
				]
			};
		}
	};
};

fakeHttpResponse.description = "Fake a wp_remote_request() response.";
fakeHttpResponse.vars = [
	{
		name: "url",
		description: "URL like https://wordpress.org/",
		type: "url",
		required: true,
		samples: [ "https://wordpress.org/" ]
	},
	{
		name: "response",
		description: "The data to return",
		type: "textarea",
		samples: [ "hello world" ]
	}
];