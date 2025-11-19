import type { StepFunction, AddPageStep, StepResult, V2SchemaFragments } from './types.js';


export const addPage: StepFunction<AddPageStep> = (step: AddPageStep): StepResult => {
	const title = step.title || step.postTitle || '';
	const content = step.content || step.postContent || '';

	return {
		toV1() {
			const postTitle = title.replace(/'/g, "\\'");
			const postContent = content.replace(/'/g, "\\'");
			let code = `
<?php require_once '/wordpress/wp-load.php';
$page_args = array(
	'post_type'    => 'page',
	'post_status'  => 'publish',
	'post_title'   => '${postTitle}',
	'post_content' => '${postContent}',
);
$page_id = wp_insert_post( $page_args );`;

			if (step.homepage) {
				code += "update_option( 'page_on_front', $page_id );";
				code += "update_option( 'show_on_front', 'page' );";
			}

			return [
				{
					step: "runPHP",
					code,
					progress: {
						caption: `addPage: ${title}`
					}
				}
			];
		},

		toV2(): V2SchemaFragments {
			const fragments: V2SchemaFragments = {};

			fragments.content = [{
				type: 'posts',
				source: {
					post_title: title,
					post_content: content,
					post_type: 'page',
					post_status: 'publish'
				}
			}];

			if (step.homepage) {
				fragments.siteOptions = {
					show_on_front: 'page'
				};

				fragments.additionalSteps = [{
					step: 'runPHP',
					code: `<?php
require_once '/wordpress/wp-load.php';
$pages = get_posts( array( 'post_type' => 'page', 'posts_per_page' => 1, 'orderby' => 'ID', 'order' => 'ASC' ) );
if ( ! empty( $pages ) ) {
	update_option( 'page_on_front', $pages[0]->ID );
	update_option( 'show_on_front', 'page' );
}`
				}];
			}

			return fragments;
		}
	};
};

addPage.description = "Add a page with title and content.";
addPage.vars = [
	{
		name: "title",
		description: "The title of the page",
		required: true,
		samples: ["Hello World"]
	},
	{
		name: "content",
		description: "The HTML content of the page",
		type: "textarea",
		language: "markup",
		required: true,
		samples: ["<p>Hello World</p>"]
	},
	{
		name: "postTitle",
		description: "The title of the page (deprecated: use 'title')",
		required: false,
		samples: ["Hello World"],
		deprecated: true
	},
	{
		name: "postContent",
		description: "The HTML content of the page (deprecated: use 'content')",
		type: "textarea",
		language: "markup",
		required: false,
		samples: ["<p>Hello World</p>"],
		deprecated: true
	},
	{
		name: "homepage",
		description: "Set it as the Homepage",
		type: "boolean",
		samples: ["true", "false"]
	}
];