customSteps.deleteAllPosts = function() {
    var steps = [
        {
            "step": "runPHP",
            "code": "<?php require_once 'wordpress/wp-load.php'; $posts = get_posts(array('numberposts' => -1)); foreach ($posts as $post) { wp_delete_post($post->ID, true); } ?>"
        }
    ];
    return steps;
};
customSteps.deleteAllPosts.description = "Delete all posts";
