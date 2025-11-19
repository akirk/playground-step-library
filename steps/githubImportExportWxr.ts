import type { StepFunction, GithubImportExportWxrStep, StepResult, V2SchemaFragments } from './types.js';
import { deleteAllPosts } from './deleteAllPosts.js';


export const githubImportExportWxr: StepFunction<GithubImportExportWxrStep> = (step: GithubImportExportWxrStep): StepResult => {
	return {
		toV1() {
	// modelled after https://github.com/carstingaxion/crud-the-docs-playground
	// props @carstingaxion
	const repoTest = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/.exec( step.repo );
	if ( ! repoTest ) {
		return [];
	}
	const repo = repoTest[1] + "/" + repoTest[2];
	const branch = step.branch;
	if ( branch && ! /^[a-z0-9_-]+$/.test( branch ) ) {
		return [];
	}
	const filename = step.filename || "export.xml";

	let steps: any[] = [];
	const siteOptions: Record<string, string> = {
		"wordpress_export_to_server__file": filename,
		"wordpress_export_to_server__owner_repo_branch": repo + ( branch ? "/" + branch : "" ),
	}
	if ( step.targetUrl ) {
		siteOptions["wordpress_export_to_server__export_home"] = step.targetUrl;
	}
	steps = steps.concat(deleteAllPosts({ step: 'deleteAllPosts' }));

	const branchSuffix = branch ? '-' + branch : '';

	steps = steps.concat([
	{
		"step": "setSiteOptions",
		"options": siteOptions
	},
	{
		"step": "defineWpConfigConsts",
		"consts": {
			"UPLOADS": "wp-content/" + repo.replace( '/', '-' ) + branchSuffix
		}
	}]);

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

	steps.push(unzipStep);

	steps = steps.concat([
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
		"code": `
		<?php require '/wordpress/wp-load.php';
		$path = realpath( '/wordpress/wp-content/${repoTest[2]}${branchSuffix}/${filename}' );
		$logger = new WP_Importer_Logger_CLI();
		$logger->min_level = 'info';
		$options = array( 'fetch_attachments' => false, 'default_author' => 1 );
		$importer = new WXR_Importer( $options );
		$importer->set_logger( $logger );
		$result = $importer->import( $path );
		`
	}
	]);
	(steps[0] as any).queryParams = {
		'gh-ensure-auth': 'yes',
		'ghexport-repo-url': 'https://github.com/' + repo,
		'ghexport-pr-action': 'create',
		'ghexport-content-type': 'custom-paths',
		'ghexport-repo-root': '/',
		'ghexport-playground-root': '/wordpress/wp-content/' + repoTest[2] + branchSuffix,
		'ghexport-path': '.',
		'ghexport-allow-include-zip': 'no',
	};

	return steps;
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
			};
		}
	};
};

githubImportExportWxr.description = "Provide useful additional info.";
githubImportExportWxr.vars = [
	{
		name: "repo",
		description: "The WXR file resides in this GitHub repository.",
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
		samples: [ "GatherPress-demo-data-2024.xml" ]
	},
	{
		name: "targetUrl",
		description: "Rewrite the exported paths to this destination URL.",
		samples: [ "https://gatherpress.test" ]
	}
];