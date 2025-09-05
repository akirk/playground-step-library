export function addPost( step ) {
	const postTitle = step.vars.postTitle.replace(/'/g, "\\'" );
	const postContent = step.vars.postContent.replace(/'/g, "\\'" );
	const postType = step.vars.postType;
	const postStatus = step.vars.postStatus || 'publish';
	
	let code = `
<?php require_once '/wordpress/wp-load.php';
$page_args = array(
	'post_type'    => '${postType}',
	'post_status'  => '${postStatus}',
	'post_title'   => '${postTitle}',
	'post_content' => '${postContent}',`;

	// Add post_date only if provided
	if ( step.vars.postDate ) {
		const postDate = step.vars.postDate.replace(/'/g, "\\'" );
		code += `
	'post_date'    => strtotime('${postDate}'),`;
	}

	code += `
);
$page_id = wp_insert_post( $page_args );`;

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
}

addPost.description = "Add a post.";
addPost.vars = [
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
		"description": "The date of the post (optional)",
		"required": false,
		"samples": [ "now", "2024-01-01 00:00:00" ]
	},
	{
		"name": "postType",
		"description": "The post type",
		"required": true,
		'regex': '^[a-z][a-z0-9_]+$',
		"samples": [ "post", "page", "custom" ]
	},
	{
		"name": "postStatus",
		"description": "The post status",
		"required": false,
		"samples": [ "publish", "draft", "private", "pending" ]
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

