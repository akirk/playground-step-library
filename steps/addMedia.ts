import type { StepFunction, AddMediaStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { StepDefinition } from '@wp-playground/blueprints';


export const addMedia: StepFunction<AddMediaStep> = (step: AddMediaStep): StepResult => {
	const downloadUrl = step.vars?.downloadUrl;

	return {
		toV1() {
			if ( !downloadUrl || !downloadUrl.match( /^https?:/ ) ) {
				return { steps: [] };
			}

			const steps: StepDefinition[] = [
				{
					step: "mkdir",
					path: "/tmp/media"
				}
			];

			if (downloadUrl.match(/\.zip$/)) {
				steps.push({
					step: "unzip",
					zipFile: {
						resource: "url",
						url: downloadUrl,
						caption: "Downloading " + downloadUrl,
					},
					extractToPath: "/tmp/media"
				});
			} else {
				const filename = downloadUrl.split('/').pop();
				steps.push({
					step: "writeFile",
					path: "/tmp/media/" + filename,
					data: {
						resource: "url",
						url: downloadUrl,
					}
				});
			}
			steps.push({
				step: "runPHP",
				progress: {
					caption: "Importing media to library"
				},
				code: `<?php
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
			});
			return { steps };
		},

		toV2() {
			if ( !downloadUrl || !downloadUrl.match( /^https?:/ ) ) {
				return { version: 2 };
			}

			// V2 media array - much simpler than v1!
			// For single files, just add the URL
			// For zips, v2 doesn't support them directly yet, so fallback to v1 logic
			if ( downloadUrl.match( /\.zip$/ ) ) {
				// Zip files need the complex v1 logic in additionalStepsAfterExecution
				return v1ToV2Fallback( this.toV1() );
			}
			// Single file - use v2 media array
			return {
				version: 2,
				media: [downloadUrl as `https://${string}`]
			};
		}
	};
};

addMedia.description = "Add files to the media library.";
addMedia.vars = [
	{
		name: "downloadUrl",
		description: "Where to download the media from (can be a zip).",
		required: true,
		samples: ["https://s.w.org/style/images/about/WordPress-logotype-wmark.png"]
	}
];