customSteps.addPage = function( step ) {
	const escapePhpString = (str) => {
		return str.replace(/(\n)|(\r)|(\t)|(\v)|(\x1b)|(\f)|[\\\$\"]/g, (m0, m1, m2, m3, m4, m5, m6) => {
			if (m1) {
				return "\\n";
			} else if (m2) {
				return "\\r";
			} else if (m3) {
				return "\\t";
			} else if (m4) {
				return "\\v";
			} else if (m5) {
				return "\\e";
			} else if (m6) {
				return "\\f";
			} else {
				return "\\" + m0;
			}
		});
	};
	const postTitle = escapePhpString(step.vars.postTitle);
	const postContent = escapePhpString(step.vars.postContent);
	let code = `
<?php require_once '/wordpress/wp-load.php';
$page_args = array(
	'post_type'    => 'page',
	'post_status'  => 'publish',
	'post_title'   => "${postTitle}",
	'post_content' => "${postContent}",
);
$page_id = wp_insert_post( $page_args );`;
	if ( step.vars.homepage ) {
		code += "update_option( 'page_on_front', $page_id );";
		code += "update_option( 'show_on_front', 'page' );";
	}
	code += "?>";

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
