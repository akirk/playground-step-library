customSteps.showNotice = function() {
    var steps = [
        {
            "step": "mkdir",
            "path": "wordpress/wp-content/mu-plugins",
        },
        {
            "step": "writeFile",
            "path": "wordpress/wp-content/mu-plugins/${step}-mu.php",
            "data": "<?php add_action( 'admin_notices', function() { echo '<div class=\"notice notice-success is-dismissible\"><p>${text}</p></div>'; } ); ?>"
        }
    ];
    return steps;
}
customSteps.showNotice.description = "Add a custom post type to the site";
customSteps.showNotice.vars = [
    {
        "name": "text",
        "description": "The notice to be displayed",
        "required": true,
        "sample": "Welcome to WordPress Playground!"
    }
];
