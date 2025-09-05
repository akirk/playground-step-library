const createVarsConfig = (config) => {
    return Object.entries(config).map(([name, varConfig]) => ({
        name,
        ...varConfig
    }));
};
export const renameDefaultCategory = (step) => {
    const name = (step.categoryName || '').replace(/'/g, "\\'").trim();
    if (!name) {
        return [];
    }
    const slug = step.categorySlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '').replace(/^-+/g, '');
    return [
        {
            "step": "runPHP",
            "code": `<?php require_once '/wordpress/wp-load.php'; wp_update_term( 1, 'category', array( 'name' => '${name}', 'slug' => '${slug}' ) ); ?>`
        }
    ];
};
renameDefaultCategory.description = "Change the default \"Uncategorized\".";
renameDefaultCategory.vars = createVarsConfig({
    categoryName: {
        description: "Change the default category name",
        required: true,
        samples: [""]
    },
    categorySlug: {
        description: "Change the default category slug",
        required: true,
        samples: [""]
    }
});
//# sourceMappingURL=renameDefaultCategory.js.map