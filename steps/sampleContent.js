export function sampleContent() {
    var steps = [
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Hello Sample Content', 'post_status' => 'publish')); ?>"
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Second Sample Content', 'post_status' => 'publish')); ?>"
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Third Sample Content', 'post_status' => 'publish')); ?>"
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Fourth Sample Content', 'post_status' => 'publish')); ?>"
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Fifth Sample Content', 'post_status' => 'publish')); ?>"
        }
    ];
    return steps;
};
sampleContent.count = 5;
sampleContent.description = "Inserts sample pages to the site.";
