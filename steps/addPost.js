customSteps.addPost = function( step ) {
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
	const postDate = step.vars.postDate.replace(/'/g, "\\'" );
	const postType = step.vars.postType;
	let code = `
<?php require_once 'wordpress/wp-load.php';
$page_args = array(
	'post_type'    => '${postType}',`;
	if ( postDate ) {
		code += `
	'post_date'    => '${postDate}',`;
	}
	code += `
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
customSteps.addPost.info = "Add a post.";
customSteps.addPost.vars = [
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
		"name": "postDate",
		"description": "The date of the post",
		"required": false,
		'regex': '^$|^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
		"samples": [ "", "2024-01-01 00:00:00" ]
	},
	{
		"name": "postType",
		"description": "The post type",
		"required": true,
		'regex': '^[a-z][a-z0-9_]+$',
		"samples": [ "post", "page", "custom" ]
	},
	{
		"label": "Register post type",
		"type": "button",
		"onclick": function( event, loadCombinedExamples ) {
			const step = event.target.closest('.step');
			const postType = step.querySelector('[name=postType]').value;
			if ( [ 'post', 'page'].includes( postType ) ) {
				event.target.textContent = 'Not necessary, built-in post type';
				setTimeout( function() {
					event.target.textContent = 'Register post type';
				}, 2000 );
				return;
			}
			const stepClone = document.getElementById( 'step-customPostType').cloneNode(true);
			stepClone.querySelector('[name=slug]').value = postType;
			stepClone.querySelector('[name=name]').value = postType.substr( 0, 1).toUpperCase() + postType.substr(1);
			document.getElementById('blueprint-steps').insertBefore( stepClone, step );
			loadCombinedExamples();
		}
	}
];
