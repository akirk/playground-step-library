import type { StepFunction, DeleteAllPostsStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const deleteAllPosts: StepFunction<DeleteAllPostsStep> = (step: DeleteAllPostsStep): StepResult => {
	return {
		toV1() {
			return {
				steps: [
					{
						"step": "runPHP",
						"code": `
<?php require_once '/wordpress/wp-load.php';
foreach ( array( 'post', 'page', 'attachment', 'revision', 'nav_menu_item' ) as $post_type ) {
$posts = get_posts( array('posts_per_page' => -1, 'post_type' => $post_type ) );
foreach ($posts as $post) wp_delete_post($post->ID, true);
}
`,
						"progress": {
							"caption": "Deleting all posts and pages"
						}
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		}
	};
};

deleteAllPosts.description = "Delete all posts, pages, attachments, revisions and menu items.";
deleteAllPosts.vars = [];