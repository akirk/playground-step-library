customSteps.addPage = function( step ) {
	const postTitle = step.vars.postTitle.replace(/'/g, "\\'" );
	const postContent = step.vars.postContent.replace(/'/g, "\\'" );
	let code = `
<?php require_once 'wordpress/wp-load.php';
$page_args = array(
	'post_type'    => 'page',
	'post_status'  => 'publish',
	'post_title'   => '${postTitle}',
	'post_content' => '${postContent}',
);
$page_id = wp_insert_post( $page_args );`
	if ( step.vars.homepage ) {
		code += "update_option( 'page_on_front', $page_id );";
		code += "update_option( 'show_on_front', 'page' );";
	}

	return [
		{
			"step": "runPHP",
			code
		}
	];
};
customSteps.addPage.info = "Add a custom page.";
customSteps.addPage.vars = [
	{
		"name": "postTitle",
		"description": "The title of the post",
		"required": true,
		"samples": [ "Hello World" ]
	},
	{
		"name": "postContent",
		"description": "The HTML of the post",
		"type": "textarea",
		"required": true,
		"samples": [ "<p>Hello World</p>" ]
	},
	{
		"name": "homepage",
		"description": "Set it as the Homepage",
		"type": "boolean",
		"samples": [ "true", "false" ]
	}
];
