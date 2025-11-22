import type { StepFunction, CustomPostTypeStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import type { StepDefinition, BlueprintV2Declaration } from '@wp-playground/blueprints';


export const customPostType: StepFunction<CustomPostTypeStep> = (step: CustomPostTypeStep): StepResult => {
	const slug = step.vars?.slug;
	const name = step.vars?.name;
	const supports = step.vars?.supports;
	const isPublic = step.vars?.public !== false;

	return {
		toV1() {
			const steps: StepDefinition[] = [
				{
					step: "mkdir",
					path: "/wordpress/wp-content/mu-plugins",
				},
				{
					step: "writeFile",
					path: "/wordpress/wp-content/mu-plugins/customPostType-${stepIndex}.php",
					data: `<?php add_action( 'init', function() { register_post_type('${slug}', array('public' => ${isPublic ? 'true' : 'false'}, 'label' => '${name}', 'supports' => ${supports ? JSON.stringify(supports) : "array( 'title', 'editor' )"})); } ); ?>`,
					progress: {
						caption: `customPostType: ${name}`
					}
				}
			];
			return { steps };
		},

		toV2(): BlueprintV2Declaration {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

customPostType.description = "Register a custom post type.";
customPostType.vars = [
	{
		name: "slug",
		description: "Post type key",
		regex: "^[a-z_]{0,20}$",
		required: true,
		samples: ["book", 'music', 'story']
	},
	{
		name: "name",
		description: "The user visible label",
		required: true,
		samples: ["Books", 'Music', 'Stories']
	},
	{
		name: "supports",
		description: "Features this post type supports",
		required: false,
		samples: ["['title', 'editor']", "['title', 'editor', 'thumbnail']", "['title', 'editor', 'custom-fields']"]
	},
	{
		name: "public",
		description: "Whether the post type is public",
		type: "boolean",
		required: false,
		samples: ["true", "false"]
	}
];