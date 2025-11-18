import type { StepFunction, RenameDefaultCategoryStep} from './types.js';


export const renameDefaultCategory: StepFunction<RenameDefaultCategoryStep> = (step: RenameDefaultCategoryStep) => {
	const name = (step.categoryName || '').replace( /'/g, "\\'" ).trim();
	if ( ! name ) {
		return [];
	}
	const slug = step.categorySlug || name.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /-+$/g, '' ).replace( /^-+/g, '' );
	return [
		{
			"step": "runPHP",
			"code": `<?php require_once '/wordpress/wp-load.php'; wp_update_term( 1, 'category', array( 'name' => '${name}', 'slug' => '${slug}' ) ); ?>`,
			"progress": {
				"caption": `renameDefaultCategory: ${name}`
			}
		}
	];
};

renameDefaultCategory.description = "Change the default \"Uncategorized\".";
renameDefaultCategory.vars = [
	{
		name: "categoryName",
		description: "Change the default category name",
		required: true,
		samples: [ "" ]
	},
	{
		name: "categorySlug",
		description: "Change the default category slug",
		required: true,
		samples: [ "" ]
	}
];