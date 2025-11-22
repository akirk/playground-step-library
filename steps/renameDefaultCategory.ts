import type { StepFunction, RenameDefaultCategoryStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';


export const renameDefaultCategory: StepFunction<RenameDefaultCategoryStep> = (step: RenameDefaultCategoryStep): StepResult => {
	return {
		toV1() {
	const name = (step.vars?.categoryName || '').replace( /'/g, "\\'" ).trim();
	if ( ! name ) {
		return { steps: [] };
	}
	const slug = step.vars?.categorySlug || name.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /-+$/g, '' ).replace( /^-+/g, '' );
	return {
		steps: [
			{
				"step": "runPHP",
				"code": `<?php require_once '/wordpress/wp-load.php'; wp_update_term( 1, 'category', array( 'name' => '${name}', 'slug' => '${slug}' ) ); ?>`,
				"progress": {
					"caption": `renameDefaultCategory: ${name}`
				}
			}
		]
	};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
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