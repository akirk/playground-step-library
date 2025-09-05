import type { StepFunction, DeleteAllPostsStep } from './types.js';

export const deleteAllPosts: StepFunction<DeleteAllPostsStep> = (step: DeleteAllPostsStep) => {
	return [
		{
			"step": "runPHP",
			"code": `
<?php require_once '/wordpress/wp-load.php';
foreach ( array( 'post', 'page', 'attachment', 'revision', 'nav_menu_item' ) as $post_type ) {
$posts = get_posts( array('posts_per_page' => -1, 'post_type' => $post_type ) );
foreach ($posts as $post) wp_delete_post($post->ID, true);
}
`
		}
	];
};

deleteAllPosts.description = "Delete all posts, pages, attachments, revisions and menu items.";
deleteAllPosts.vars = [];