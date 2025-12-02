import type { StepFunction, GithubImportExportWxrStep, StepResult, CompilationContext } from './types.js';
import { v1ToV2Fallback } from './types.js';
import { deleteAllPosts } from './deleteAllPosts.js';


export const githubImportExportWxr: StepFunction<GithubImportExportWxrStep> = ( step: GithubImportExportWxrStep, context?: CompilationContext ): StepResult => {
	return {
		toV1() {
			// modelled after https://github.com/carstingaxion/crud-the-docs-playground
			// props @carstingaxion
			const repoRegex = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/;
			const repoTest = repoRegex.test( step.vars?.repo || '' ) ? ( step.vars?.repo || '' ).match( repoRegex ) : null;
			if ( !repoTest ) {
				return { steps: [] };
			}
			const repo = repoTest[1] + "/" + repoTest[2];
			const branch = step.vars?.branch;
			if ( branch && !/^[a-z0-9_-]+$/.test( branch ) ) {
				return { steps: [] };
			}
			const filename = step.vars?.filename || "export.xml";
			const branchSuffix = branch ? '-' + branch : '';

			context?.setQueryParams( {
				'gh-ensure-auth': 'yes',
				'ghexport-repo-url': 'https://github.com/' + repo,
				'ghexport-pr-action': 'create',
				'ghexport-content-type': 'custom-paths',
				'ghexport-repo-root': '/',
				'ghexport-playground-root': '/wordpress/wp-content/' + repoTest[2] + branchSuffix,
				'ghexport-path': '.',
				'ghexport-allow-include-zip': 'no',
			} );

			let steps: any[] = [];
			const siteOptions: Record<string, string> = {
				"wordpress_export_to_server__file": filename,
				"wordpress_export_to_server__owner_repo_branch": repo + ( branch ? "/" + branch : "" ),
			};
			if ( step.vars?.targetUrl ) {
				siteOptions["wordpress_export_to_server__export_home"] = step.vars?.targetUrl;
			}
			const deleteResult = deleteAllPosts( { step: 'deleteAllPosts' } ).toV1();
			steps = steps.concat( deleteResult.steps );

			steps = steps.concat( [
				{
					"step": "setSiteOptions",
					"options": siteOptions
				},
				{
					"step": "defineWpConfigConsts",
					"consts": {
						"UPLOADS": "wp-content/" + repo.replace( '/', '-' ) + branchSuffix
					}
				}
			] );

			const unzipStep: any = {
				"step": "unzip",
				"zipFile": {
					"resource": "git:directory",
					"url": `https://github.com/${repo}`,
					"ref": branch || "HEAD"
				},
				"extractToPath": "/wordpress/wp-content"
			};

			if ( branch ) {
				unzipStep.zipFile.refType = "branch";
			}

			steps.push( unzipStep );

			steps = steps.concat( [
				{
					"step": "writeFile",
					"path": "/wordpress/wp-content/mu-plugins/wordpress-export-to-server.php",
					"data": {
						"resource": "url",
						"url": "https://raw.githubusercontent.com/carstingaxion/wordpress-export-to-server/main/wordpress-export-to-server.php"
					}
				},
				{
					"step": "installPlugin",
					"pluginZipFile": {
						"resource": "git:directory",
						"url": "https://github.com/humanmade/WordPress-Importer",
						"ref": "master",
						"refType": "branch"
					}
				},
				{
					"step": "runPHP",
					"code": `<?php require '/wordpress/wp-load.php';
		$path = realpath( '/wordpress/wp-content/${repoTest[2]}${branchSuffix}/${filename}' );
		$logger = new WP_Importer_Logger_CLI();
		$logger->min_level = 'info';
		$options = array( 'fetch_attachments' => false, 'default_author' => 1 );
		$importer = new WXR_Importer( $options );
		$importer->set_logger( $logger );
		$result = $importer->import( $path );
		`
				}
			] );

			return { steps };
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

githubImportExportWxr.description = "Provide useful additional info.";
githubImportExportWxr.vars = [
	{
		name: "repo",
		description: "The WXR file resides in this GitHub repository.",
		required: true,
		samples: [ "carstingaxion/gatherpress-demo-data" ]
	},
	{
		name: "branch",
		description: "Which branch to use.",
		samples: [ "main" ]
	},
	{
		name: "filename",
		description: "Which filename and path to use.",
		required: true,
		samples: [ "GatherPress-demo-data-2024.xml" ]
	},
	{
		name: "targetUrl",
		description: "Rewrite the exported paths to this destination URL.",
		samples: [ "https://gatherpress.test" ]
	}
];