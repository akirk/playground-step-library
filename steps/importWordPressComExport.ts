import type { StepFunction, ImportWordPressComExportStep} from './types.js';


export const importWordPressComExport: StepFunction<ImportWordPressComExportStep> = (step: ImportWordPressComExportStep) => {
	return [
		{
			"step": "mkdir",
			"path": "/tmp/"
		},
		{
			"step": "unzip",
			"zipFile": {
				"resource": "url",
				"url": step.url
			},
			"extractToPath": "/tmp"
		},
		{
			"step": "runPHP",
			"code": `
<?php
$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( '/tmp/' ) );
foreach ( $iterator as $file ) {
	if ( ! $file->isFile() || 'xml' !== $file->getExtension() ) continue;
	rename( $file->getPathname(), '/tmp/export.xml' );
	exit;
}
`
		},
		{
			"step": "importWxr",
			"file": {
				"resource": "vfs",
				"path": "/tmp/export.xml"
			}
		}
	];
};

importWordPressComExport.description = "Import a WordPress.com export file (WXR in a ZIP)";
importWordPressComExport.vars = [
	{
		name: "url",
		description: "URL of a WordPress.com export ZIP file",
		required: true,
		samples: [""]
	}
];