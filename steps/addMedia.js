customSteps.addMedia = function( step ) {
	if ( ! step.vars.downloadUrl || ! step.vars.downloadUrl.match( /^https?:/ ) ) {
		return [];
	}

	const steps = [
	{
		"step": "mkdir",
		"path": "/tmp/media"
	}
	];

	if ( step.vars.downloadUrl.match( /\.zip$/ ) ) {
		steps.push( {
			"step": "unzip",
			"zipFile": {
                "resource": "url",
                "url": 'https://playground.wordpress.net/cors-proxy.php?' + step.vars.downloadUrl
            },
            "extractToPath": "/tmp/media"
		} );
	} else {
		const filename = step.vars.downloadUrl.split( '/' ).pop();
		steps.push( {
			"step": "writeFile",
			"path": "/tmp/media/" + filename,
			"data": {
				"resource": "url",
				"url": step.vars.downloadUrl,
			}
		} );
	}
	steps.push( {
		"step": "runPHP",
		"dedup": "last",
		"code": `
<?php
require_once 'wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( '/tmp/media/' ) );
foreach ( $iterator as $filename ) {
	if ( ! $filename->isFile() ) continue;
	$file = array(
		'tmp_name' => $filename->getPathname(),
		'name'     => $filename->getBasename(),
		'type'     => mime_content_type( $filename->getPathname() ),
		'size'     => $filename->getSize(),
	);
	$attachment_id = media_handle_sideload( $file );
	if ( is_wp_error( $attachment_id ) ) {
		error_log( print_r( $attachment_id, true ) );
	}
}

`
	} );
	return steps;
};
customSteps.addMedia.info = "Add files to the media library.";
customSteps.addMedia.vars = [
	{
		"name": "downloadUrl",
		"description": "Where to download the media from (can be a zip).",
		"required": true,
		"samples": [ "https://s.w.org/style/images/about/WordPress-logotype-wmark.png" ]
	}
];
