import type { StepFunction, ImportWordPressComExportStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';


export const importWordPressComExport: StepFunction<ImportWordPressComExportStep> = (step: ImportWordPressComExportStep): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						step: "mkdir" as const,
						path: "/tmp/"
					},
					{
						step: "unzip" as const,
						zipFile: {
							resource: "url" as const,
							url: step.vars?.url || ''
						},
						extractToPath: "/tmp"
					},
					{
						step: "runPHP" as const,
						code: `<?php
$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( '/tmp/' ) );
foreach ( $iterator as $file ) {
	if ( ! $file->isFile() || 'xml' !== $file->getExtension() ) continue;
	rename( $file->getPathname(), '/tmp/export.xml' );
	exit;
}
`
					},
					{
						step: "importWxr" as const,
						file: {
							resource: "vfs" as const,
							path: "/tmp/export.xml"
						}
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
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