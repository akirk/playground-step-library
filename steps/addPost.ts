import type { StepFunction, AddPostStep } from './types.js';

export const addPost: StepFunction<AddPostStep> = (step: AddPostStep) => {
	const postTitle = (step.title || step.postTitle || '').replace(/'/g, "\\'");
	const postContent = (step.content || step.postContent || '').replace(/'/g, "\\'");
	const postType = step.type || step.postType;
	const postStatus = step.status || step.postStatus || 'publish';
	const postId = (step.postId !== undefined && step.postId !== null && String(step.postId) !== '') ? Number(step.postId) : 0;

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

	// Add post_date only if provided
	const dateValue = step.date || step.postDate;
	if (dateValue) {
		const postDate = dateValue.replace(/'/g, "\\'");
		code += `
	'post_date'    => strtotime('${postDate}'),`;
	}

	code += `
);
$page_id = wp_insert_post( $page_args );`;

	if (step.homepage) {
		code += "update_option( 'page_on_front', $page_id );";
		code += "update_option( 'show_on_front', 'page' );";
	}

	const result = [
		{
			"step": "runPHP",
			code,
			"progress": {
				"caption": `addPost: ${postTitle}`
			}
		}
	] as any;

	if (step.landingPage !== false && postId > 0) {
		result.landingPage = `/wp-admin/post.php?post=${postId}&action=edit`;
	}

	return result;
};

addPost.description = "Add a post with title, content, type, status, and date.";
addPost.vars = Object.entries({
	title: {
		description: "The title of the post",
		required: true,
		samples: ["Hello World"]
	},
	content: {
		description: "The HTML content of the post",
		type: "textarea",
		language: "markup",
		required: true,
		samples: ["<p>Hello World</p>"]
	},
	date: {
		description: "The date of the post (optional)",
		required: false,
		samples: ["now", "2024-01-01 00:00:00"]
	},
	type: {
		description: "The post type",
		required: true,
		regex: '^[a-z][a-z0-9_]+$',
		samples: ["post", "page", "custom"]
	},
	status: {
		description: "The post status",
		required: false,
		samples: ["publish", "draft", "private", "pending"]
	},
	postId: {
		description: "Post ID to use (optional)",
		type: "text",
		required: false,
		samples: ["", "1000", "2000", "5000"]
	},
	landingPage: {
		description: "Set landing page to the post editor (requires postId)",
		type: "boolean",
		required: false,
		samples: ["true", "false"]
	},
	// Backward compatibility - keep old variable names
	postTitle: {
		description: "The title of the post (deprecated: use 'title')",
		required: false,
		samples: ["Hello World"],
		deprecated: true
	},
	postContent: {
		description: "The HTML content of the post (deprecated: use 'content')",
		type: "textarea",
		language: "markup",
		required: false,
		samples: ["<p>Hello World</p>"],
		deprecated: true
	},
	postDate: {
		description: "The date of the post (deprecated: use 'date')",
		required: false,
		samples: ["now", "2024-01-01 00:00:00"],
		deprecated: true
	},
	postType: {
		description: "The post type (deprecated: use 'type')",
		required: false,
		regex: '^[a-z][a-z0-9_]+$',
		samples: ["post", "page", "custom"],
		deprecated: true
	},
	postStatus: {
		description: "The post status (deprecated: use 'status')",
		required: false,
		samples: ["publish", "draft", "private", "pending"],
		deprecated: true
	}
}).map(([name, varConfig]) => ({ name, ...varConfig }));

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