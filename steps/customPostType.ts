import type { StepFunction, CustomPostTypeStep, StepResult, V2SchemaFragments } from './types.js';
import type { StepDefinition } from '@wp-playground/blueprints';


export const customPostType: StepFunction<CustomPostTypeStep> = (step: CustomPostTypeStep): StepResult => {
	const slug = step.slug;
	const name = step.name;
	const supports = step.supports;
	const isPublic = step.public !== false;

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

		toV2(): V2SchemaFragments {
			const fragments: V2SchemaFragments = {};

			// V2 postTypes - declarative custom post type registration
			// Note: This requires the 'secure-custom-fields' plugin in v2
			fragments.postTypes = {
				[slug]: {
					label: name,
					public: isPublic,
					supports: supports || ['title', 'editor']
				}
			};

			// Ensure secure-custom-fields plugin is included
			fragments.plugins = ['secure-custom-fields'];

			return fragments;
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