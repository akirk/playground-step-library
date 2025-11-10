import type { StepFunction, AddMediaStep} from './types.js';


export const addMedia: StepFunction<AddMediaStep> = (step: AddMediaStep) => {
	if ( ! step.downloadUrl || ! step.downloadUrl.match( /^https?:/ ) ) {
		return [];
	}

	const steps: any[] = [
	{
		"step": "mkdir",
		"path": "/tmp/media"
	}
	];

	if ( step.downloadUrl.match( /\.zip$/ ) ) {
		steps.push( {
			"step": "unzip",
			"zipFile": {
                "resource": "url",
                "url": step.downloadUrl,
	            "caption": "Downloading " + step.downloadUrl,
            },
            "extractToPath": "/tmp/media"
		} );
	} else {
		const filename = step.downloadUrl.split( '/' ).pop();
		steps.push( {
			"step": "writeFile",
			"path": "/tmp/media/" + filename,
			"data": {
				"resource": "url",
				"url": step.downloadUrl,
			}
		} );
	}
	steps.push( {
		"step": "runPHP",
		"code": `<?php
// DEDUP_STRATEGY: keep_last
require_once '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( '/tmp/media/' ) );
foreach ( $iterator as $filename ) {
	if ( ! $filename->isFile() ) continue;

	// Skip Macos hidden files:
	if ( strpos( $filename->getFilename(), '._' ) === 0 ) continue;
	if ( strtolower( $filename->getFilename() ) === '.ds_store' ) continue;

	$file = array(
		'tmp_name' => $filename->getPathname(),
		'name'     => $filename->getBasename(),
		'type'     => mime_content_type( $filename->getPathname() ),
		'size'     => $filename->getSize(),
	);
	$attachment_id = media_handle_sideload( $file );
	if ( is_wp_error( $attachment_id ) ) {
		error_log( print_r( $file, true ) );
		error_log( print_r( $attachment_id, true ) );
	}
}

`
	} );
	return steps;
};

addMedia.description = "Add files to the media library.";
addMedia.vars = Object.entries({
	downloadUrl: {
		description: "Where to download the media from (can be a zip).",
		required: true,
		samples: [ "https://s.w.org/style/images/about/WordPress-logotype-wmark.png" ]
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));