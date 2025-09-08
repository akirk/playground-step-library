export const addPage = (step) => {
    const postTitle = (step.title || step.postTitle || '').replace(/'/g, "\\'");
    const postContent = (step.content || step.postContent || '').replace(/'/g, "\\'");
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
addPage.description = "Add a page with title and content.";
addPage.vars = Object.entries({
    title: {
        description: "The title of the page",
        required: true,
        samples: ["Hello World"]
    },
    content: {
        description: "The HTML content of the page",
        type: "textarea",
        required: true,
        samples: ["<p>Hello World</p>"]
    },
    // Backward compatibility - keep old variable names
    postTitle: {
        description: "The title of the page (deprecated: use 'title')",
        required: false,
        samples: ["Hello World"],
        deprecated: true
    },
    postContent: {
        description: "The HTML content of the page (deprecated: use 'content')",
        type: "textarea",
        required: false,
        samples: ["<p>Hello World</p>"],
        deprecated: true
    },
    homepage: {
        description: "Set it as the Homepage",
        type: "boolean",
        samples: ["true", "false"]
    }
}).map(([name, varConfig]) => ({ name, ...varConfig }));
//# sourceMappingURL=addPage.js.map