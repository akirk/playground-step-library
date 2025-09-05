export const importWordPressComExport = (step) => {
    const url = step.corsProxy ? 'https://playground.wordpress.net/cors-proxy.php?' + step.url : step.url;
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
importWordPressComExport.description = "Import a WordPress.com export file (WXR in a ZIP)";
importWordPressComExport.vars = Object.entries({
    url: {
        description: "URL of a WordPress.com export ZIP file",
        required: true,
        samples: [""]
    },
    corsProxy: {
        description: "Use a cors proxy for the request",
        required: true,
        type: "boolean",
        samples: ["true", "false"]
    }
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=importWordPressComExport.js.map