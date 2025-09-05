const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const addPost = (step) => {
    const postTitle = step.postTitle?.replace(/'/g, "\\'") || '';
    const postContent = step.postContent?.replace(/'/g, "\\'") || '';
    const postType = step.postType;
    const postStatus = step.postStatus || 'publish';
    let code = `
<?php require_once '/wordpress/wp-load.php';
$page_args = array(
	'post_type'    => '${postType}',
	'post_status'  => '${postStatus}',
	'post_title'   => '${postTitle}',
	'post_content' => '${postContent}',`;
    // Add post_date only if provided
    if (step.postDate) {
        const postDate = step.postDate.replace(/'/g, "\\'");
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
    return [
        {
            "step": "runPHP",
            code
        }
    ];
};
addPost.description = "Add a post.";
addPost.vars = createVarsConfig({
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
    postDate: {
        description: "The date of the post (optional)",
        required: false,
        samples: ["now", "2024-01-01 00:00:00"]
    },
    postType: {
        description: "The post type",
        required: true,
        regex: '^[a-z][a-z0-9_]+$',
        samples: ["post", "page", "custom"]
    },
    postStatus: {
        description: "The post status",
        required: false,
        samples: ["publish", "draft", "private", "pending"]
    }
});
// Add the onclick function to the vars config
addPost.vars.push({
    name: "registerPostType",
    description: "Register custom post type if needed",
    label: "Register post type",
    type: "button",
    onclick: function (event, loadCombinedExamples) {
        const step = event.target.closest('.step');
        const postTypeElement = step?.querySelector('[name=postType]');
        const postType = postTypeElement?.value;
        if (['post', 'page'].includes(postType || '')) {
            event.target.textContent = 'Not necessary, built-in post type';
            setTimeout(function () {
                event.target.textContent = 'Register post type';
            }, 2000);
            return;
        }
        const stepClone = document.getElementById('step-customPostType')?.cloneNode(true);
        const slugInput = stepClone?.querySelector('[name=slug]');
        const nameInput = stepClone?.querySelector('[name=name]');
        if (slugInput)
            slugInput.value = postType || '';
        if (nameInput && postType)
            nameInput.value = postType.substr(0, 1).toUpperCase() + postType.substr(1);
        const stepsContainer = document.getElementById('blueprint-steps');
        if (stepsContainer && stepClone) {
            stepsContainer.insertBefore(stepClone, step);
        }
        loadCombinedExamples();
    }
});
//# sourceMappingURL=addPost.js.map