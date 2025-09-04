customSteps.renameDefaultCategory = function( step ) {
	const name = step.vars.categoryName.replace( /'/g, "\\'" ).trim();
	if ( ! name ) {
		return [];
	}
	const slug = step.vars.categorySlug || name.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /-+$/g, '' ).replace( /^-+/g, '' );
	return [
		{
			"step": "runPHP",
			"code": `<?php require_once '/wordpress/wp-load.php'; wp_update_term( 1, 'category', array( 'name' => '${name}', 'slug' => '${slug}' ) ); ?>`
		}
	];
};
customSteps.renameDefaultCategory.description = "Change the default \"Uncategorized\".";
customSteps.renameDefaultCategory.vars = [
	{
		"name": "categoryName",
		"description": "Change the default category name",
		"required": true,
		"samples": [ "" ]
	},
	{
		"name": "categorySlug",
		"description": "Change the default category slug",
		"required": true,
		"samples": [ "" ]
	}
];
