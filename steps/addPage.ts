import type { StepFunction, AddPageStep, StepVariable } from './types.js';

const createVarsConfig = (config: Record<string, Omit<StepVariable, 'name'>>): StepVariable[] => {
	return Object.entries(config).map(([name, varConfig]) => ({
		name,
		...varConfig
	}));
};

export const addPage: StepFunction<AddPageStep> = (step: AddPageStep) => {
	const postTitle = step.postTitle.replace(/'/g, "\\'");
	const postContent = step.postContent.replace(/'/g, "\\'");
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
			"step": "runPHP",
			code
		}
	];
};

addPage.description = "Add a custom page.";
addPage.vars = createVarsConfig({
	postTitle: {
		description: "The title of the post",
		required: true,
		samples: ["Hello World"]
	},
	postContent: {
		description: "The HTML of the post",
		type: "textarea",
		required: true,
		samples: ["<p>Hello World</p>"]
	},
	homepage: {
		description: "Set it as the Homepage",
		type: "boolean",
		samples: ["true", "false"]
	}
});