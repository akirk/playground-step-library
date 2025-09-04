customSteps.importWordPressComExport = function( step ) {
	const url = step.vars.corsProxy ? 'https://playground.wordpress.net/cors-proxy.php?' + step.vars.url : step.vars.url;
	return [
		{
			"step": "mkdir",
			"path": "/tmp/"
		},
		{
			"step": "unzip",
			"zipFile": {
				"resource": "url",
				url
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
customSteps.importWordPressComExport.description = "";
customSteps.importWordPressComExport.vars = [
	{
		"name": "url",
		"description": "URL of a WordPress.com export ZIP file",
		"required": true,
		"samples": [ "" ]
	},
	{
		"name": "corsProxy",
		"description": "Use a cors proxy for the request",
		"required": true,
		"type": "boolean",
		"samples": [ "true", "false" ]
	}
];
