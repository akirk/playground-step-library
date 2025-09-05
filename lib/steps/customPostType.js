const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const customPostType = (step) => {
    var steps = [
        {
            "step": "mkdir",
            "path": "/wordpress/wp-content/mu-plugins",
        },
        {
            "step": "writeFile",
            "path": "/wordpress/wp-content/mu-plugins/customPostType-${stepIndex}.php",
            "data": `<?php add_action( 'init', function() { register_post_type('${step.slug}', array('public' => ${step.public !== false ? 'true' : 'false'}, 'label' => '${step.name}', 'supports' => ${step.supports ? JSON.stringify(step.supports) : "array( 'title', 'editor' )"})); } ); ?>`
        }
    ];
    return steps;
};
customPostType.description = "Register a custom post type.";
customPostType.vars = createVarsConfig({
    slug: {
        description: "Post type key",
        regex: "^[a-z_]{0,20}$",
        required: true,
        samples: ["book", 'music', 'story']
    },
    name: {
        description: "The user visible label",
        required: true,
        samples: ["Books", 'Music', 'Stories']
    },
    supports: {
        description: "Features this post type supports",
        required: false,
        samples: ["['title', 'editor']", "['title', 'editor', 'thumbnail']", "['title', 'editor', 'custom-fields']"]
    },
    public: {
        description: "Whether the post type is public",
        type: "boolean",
        required: false,
        samples: ["true", "false"]
    }
});
//# sourceMappingURL=customPostType.js.map