customSteps.customPostType = function() {
	var steps = [
		{
			"step": "mkdir",
			"path": "wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "wordpress/wp-content/mu-plugins/customPostType-${stepIndex}.php",
			"data": "<?php add_action( 'init', function() { register_post_type('${slug}', array('public' => true, 'label' => '${name}')); } ); ?>"
		}
	];
	return steps;
}
customSteps.customPostType.vars = [
	{
		"name": "slug",
		"description": "Post type key",
		"regex": "^[a-z_]{0,20}$",
		"required": true,
		"samples": [ "book", 'music', 'story' ]
	},
	{
		"name": "name",
		"description": "The user visible label",
		"required": true,
		"samples": [ "Books", 'Music', 'Stories' ]
	}
];
