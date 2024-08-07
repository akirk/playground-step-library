customSteps.githubImportExportWxr = function( step ) {
	// modelled after https://github.com/carstingaxion/crud-the-docs-playground
	// props @carstingaxion
	const repoTest = /(?:https:\/\/github.com\/)?([^\/]+)\/([^\/]+)/.exec( step.vars.repo );
	if ( ! repoTest ) {
		return [];
	}
	const repo = repoTest[1] + "/" + repoTest[2];
	const branch = step.vars.branch || "main";
	if ( ! /^[a-z0-9-]+$/.test( branch ) ) {
		return [];
	}
	const filename = step.vars.filename || "export.xml";

	let steps = [];
	const siteOptions = {
		"wordpress_export_to_server__file": filename,
		"wordpress_export_to_server__owner_repo_branch": repo + "/" + branch,
	}
	if ( step.vars.targetUrl ) {
		siteOptions["wordpress_export_to_server__export_home"] = step.vars.targetUrl;
	}
	steps = steps.concat(customSteps.deleteAllPosts());
	steps = steps.concat([
	{
		"step": "setSiteOptions",
		"options": siteOptions
	},
	{
		"step": "defineWpConfigConsts",
		"consts": {
			"UPLOADS": "wp-content/" + repo + "-" + branch
		}
	},
	{
		"step": "unzip",
		"zipFile": {
			"resource": "url",
			"url": `https://github-proxy.com/proxy/?repo=${repo}&branch=${branch}`,
		},
		"extractToPath": "/wordpress/wp-content"
	},
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
			"resource": "url",
			"url": "https://github-proxy.com/proxy/?repo=humanmade/WordPress-Importer"
		}
	},
	{
		"step": "runPHP",
		"code": `
		<?php require '/wordpress/wp-load.php';
		$path = realpath( '/wordpress/wp-content/${repoTest[2]}-${branch}/${filename}' );
		$logger = new WP_Importer_Logger_CLI();
		$logger->min_level = 'info';
		$options = array( 'fetch_attachments' => false, 'default_author' => 1 );
		$importer = new WXR_Importer( $options );
		$importer->set_logger( $logger );
		$result = $importer->import( $path );
		`
	}
	]);
	steps[0].queryParams = {
		'gh-ensure-auth': 'yes',
		'ghexport-repo-url': 'https://github.com/' + repo,
		'ghexport-pr-action': 'create',
		'ghexport-content-type': 'custom-paths',
		'ghexport-repo-root': '/',
		'ghexport-playground-root': '/wordpress/wp-content/' + repoTest[2] + '-' + branch,
		'ghexport-path': '.',
		'ghexport-allow-include-zip': 'no',
	};

	return steps;
};
customSteps.githubImportExportWxr.info = "Provide useful additional info.";
customSteps.githubImportExportWxr.vars = [
{
	"name": "repo",
	"description": "The WXR file resides in this GitHub repository.",
	"samples": [ "carstingaxion/gatherpress-demo-data" ]
},
{
	"name": "branch",
	"description": "Which branch to use.",
	"samples": [ "main" ]
},
{
	"name": "filename",
	"description": "Which filename and path to use.",
	"samples": [ "GatherPress-demo-data-2024.xml" ]
},
{
	"name": "targetUrl",
	"description": "Rewrite the exported paths to this destination URL.",
	"samples": [ "https://gatherpress.test" ]
}
];
