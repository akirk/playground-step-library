import type { StepFunction, AddPostStep, StepResult } from './types.js';
import type { BlueprintV1Declaration, BlueprintV2Declaration } from '@wp-playground/blueprints';

export const addPost: StepFunction<AddPostStep> = (step: AddPostStep): StepResult => {
	const title = step.title || step.postTitle || '';
	const content = step.content || step.postContent || '';
	const postType = step.type || step.postType;
	const postStatus = step.status || step.postStatus || 'publish';
	const postId = (step.postId !== undefined && step.postId !== null && String(step.postId) !== '') ? Number(step.postId) : 0;
	const dateValue = step.date || step.postDate;

	return {
		toV1() {
			const postTitle = title.replace(/'/g, "\\'");
			const postContent = content.replace(/'/g, "\\'");

			let code = `
<?php require_once '/wordpress/wp-load.php';
$page_args = array(
	'post_type'    => '${postType}',
	'post_status'  => '${postStatus}',
	'post_title'   => '${postTitle}',
	'post_content' => '${postContent}',`;

			// Add import_id only if postId is provided
			if (postId > 0) {
				code += `
	'import_id'    => ${postId},`;
			}

			// Add post_date only if provided (skip 'now' since it's the default)
			if (dateValue && dateValue !== 'now') {
				const postDate = dateValue.replace(/'/g, "\\'");
				code += `
	'post_date'    => date( 'Y-m-d H:i:s', strtotime( '${postDate}' ) ),`;
			}

			code += `
);
$page_id = wp_insert_post( $page_args, true );
if ( is_wp_error( $page_id ) ) {
	error_log( 'addPost error: ' . $page_id->get_error_message() );
}`;

			if (step.homepage) {
				code += "update_option( 'page_on_front', $page_id );";
				code += "update_option( 'show_on_front', 'page' );";
			}

			const result: BlueprintV1Declaration = {
				steps: [
					{
						step: "runPHP",
						code,
						progress: {
							caption: `addPost: ${title}`
						}
					}
				]
			};

			if (step.landingPage !== false && postId > 0) {
				result.landingPage = `/wp-admin/post.php?post=${postId}&action=edit`;
			}

			return result;
		},

		toV2() {
			const postData: any = {
				post_title: title,
				post_content: content,
				post_type: postType,
				post_status: postStatus
			};

			// Add post_date if provided (skip 'now' since it's the default)
			if (dateValue && dateValue !== 'now') {
				postData.post_date = dateValue;
			}

			// Add import_id if provided (not standard v2, but useful for imports)
			if (postId > 0) {
				postData.import_id = postId;
			}

			const result: BlueprintV2Declaration = {
				version: 2,
				content: [{
					type: 'posts',
					source: postData
				}]
			};

			// Handle homepage setting
			if (step.homepage) {
				result.siteOptions = {
					show_on_front: 'page'
				};

				// Find the page we just created by title (since we don't have an ID in v2 declarative format)
				result.additionalStepsAfterExecution = [{
					step: 'runPHP',
					code: {
						filename: 'set-homepage.php',
						content: `<?php
require_once '/wordpress/wp-load.php';
$pages = get_posts( array(
	'post_type' => '${postType}',
	'title' => '${title.replace(/'/g, "\\'")}',
	'posts_per_page' => 1,
	'orderby' => 'ID',
	'order' => 'DESC'
) );
if ( ! empty( $pages ) ) {
	update_option( 'page_on_front', $pages[0]->ID );
	update_option( 'show_on_front', 'page' );
}`
					}
				}];
			}

			// Handle landing page setting
			if (step.landingPage !== false && postId > 0) {
				result.applicationOptions = {
					'wordpress-playground': {
						landingPage: `/wp-admin/post.php?post=${postId}&action=edit`
					}
				};
			}

			return result;
		}
	};
};

addPost.description = "Add a post with title, content, type, status, and date.";
addPost.vars = [
	{
		name: "title",
		description: "The title of the post",
		required: true,
		samples: ["Hello World"]
	},
	{
		name: "content",
		description: "The HTML content of the post",
		type: "textarea",
		language: "markup",
		required: true,
		samples: ["<p>Hello World</p>"]
	},
	{
		name: "date",
		description: "The date of the post (optional)",
		required: false,
		samples: ["now", "2024-01-01 00:00:00"]
	},
	{
		name: "type",
		description: "The post type",
		required: true,
		regex: '^[a-z][a-z0-9_]+$',
		samples: ["post", "page", "custom"]
	},
	{
		name: "status",
		description: "The post status",
		required: false,
		samples: ["publish", "draft", "private", "pending"]
	},
	{
		name: "postId",
		description: "Post ID to use (optional)",
		type: "text",
		required: false,
		samples: ["", "1000", "2000", "5000"]
	},
	{
		name: "landingPage",
		description: "Set landing page to the post editor (requires postId)",
		type: "boolean",
		required: false,
		samples: ["false", "true"]
	},
	{
		name: "postTitle",
		description: "The title of the post (deprecated: use 'title')",
		required: false,
		samples: ["Hello World"],
		deprecated: true
	},
	{
		name: "postContent",
		description: "The HTML content of the post (deprecated: use 'content')",
		type: "textarea",
		language: "markup",
		required: false,
		samples: ["<p>Hello World</p>"],
		deprecated: true
	},
	{
		name: "postDate",
		description: "The date of the post (deprecated: use 'date')",
		required: false,
		samples: ["now", "2024-01-01 00:00:00"],
		deprecated: true
	},
	{
		name: "postType",
		description: "The post type (deprecated: use 'type')",
		required: false,
		regex: '^[a-z][a-z0-9_]+$',
		samples: ["post", "page", "custom"],
		deprecated: true
	},
	{
		name: "postStatus",
		description: "The post status (deprecated: use 'status')",
		required: false,
		samples: ["publish", "draft", "private", "pending"],
		deprecated: true
	}
];

// Add the onclick function to the vars config
addPost.vars.push({
	name: "registerPostType",
	description: "Register custom post type if needed",
	label: "Register post type",
	type: "button",
	show: function (step: any) {
		const postType = step.querySelector('[name=type], [name=postType]')?.value;
		return postType && !['post', 'page'].includes(postType);
	},
	onclick: function (event: any, loadCombinedExamples: any) {
		const step = event.target.closest('.step') as HTMLElement;
		const postTypeElement = step?.querySelector('[name=type], [name=postType]') as HTMLInputElement;
		const postType = postTypeElement?.value;

		const stepClone = document.getElementById('step-customPostType')?.cloneNode(true) as HTMLElement;
		const slugInput = stepClone?.querySelector('[name=slug]') as HTMLInputElement;
		const nameInput = stepClone?.querySelector('[name=name]') as HTMLInputElement;
		if (slugInput) slugInput.value = postType || '';
		if (nameInput && postType) nameInput.value = postType.substr(0, 1).toUpperCase() + postType.substr(1);
		const stepsContainer = document.getElementById('blueprint-steps');
		if (stepsContainer && stepClone) {
			stepsContainer.insertBefore(stepClone, step);
		}
		loadCombinedExamples();
	}
});