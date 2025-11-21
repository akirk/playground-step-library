import type { StepFunction, AddTemplateStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const addTemplate: StepFunction<AddTemplateStep> = ( step: AddTemplateStep ): StepResult => {
	const slug = step.slug || '';
	const theme = step.theme || ''; // Empty means current active theme
	const content = step.content || '';
	const title = step.title || slug;

	return {
		toV1() {
			const escapedSlug = slug.replace( /'/g, "\\'" );
			const escapedTheme = theme.replace( /'/g, "\\'" );
			const escapedContent = content.replace( /'/g, "\\'" );
			const escapedTitle = title.replace( /'/g, "\\'" );

			const code = `<?php
require_once '/wordpress/wp-load.php';

$theme_slug = '${escapedTheme}';
if ( empty( $theme_slug ) ) {
	$theme_slug = get_stylesheet();
}
$term = get_term_by( 'slug', $theme_slug, 'wp_theme' );
if ( ! $term ) {
	$term = wp_insert_term( $theme_slug, 'wp_theme' );
	$term_id = $term['term_id'];
} else {
	$term_id = $term->term_id;
}

$post_id = wp_insert_post( array(
	'post_title'   => '${escapedTitle}',
	'post_name'    => '${escapedSlug}',
	'post_type'    => 'wp_template',
	'post_status'  => 'publish',
	'post_content' => '${escapedContent}',
	'tax_input'    => array(
		'wp_theme' => array( $term_id )
	),
) );

if ( ! is_wp_error( $post_id ) ) {
	wp_set_object_terms( $post_id, $term_id, 'wp_theme' );
}
`;

			return {
				steps: [
					{
						step: 'runPHP',
						code,
						progress: {
							caption: `addTemplate: ${slug}`
						}
					}
				]
			};
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

addTemplate.description = "Add a template (home, single, page, etc.) for a block theme.";
addTemplate.vars = [
	{
		name: 'slug',
		description: 'The template slug (e.g., "home", "single", "page", "archive")',
		type: 'text',
		required: true,
		samples: ['home', 'single', 'page', 'archive', 'index']
	},
	{
		name: 'theme',
		description: 'The theme slug (empty = current active theme)',
		type: 'text',
		required: false,
		samples: ['', 'twentytwentyfour', 'twentytwentyfive']
	},
	{
		name: 'content',
		description: 'The block markup content',
		type: 'textarea',
		language: 'markup',
		required: true,
		samples: [
			'<!-- wp:template-part {"slug":"header","tagName":"header","area":"header"} /-->\n\n<!-- wp:post-content /-->\n\n<!-- wp:template-part {"slug":"footer","tagName":"footer","area":"footer"} /-->',
			'<!-- wp:template-part {"slug":"header","tagName":"header","area":"header"} /-->\n\n<!-- wp:query {"queryId":1,"query":{"perPage":10,"postType":"post","order":"desc","orderBy":"date"}} -->\n<div class="wp-block-query"><!-- wp:post-template -->\n<!-- wp:post-title {"isLink":true} /-->\n<!-- wp:post-excerpt /-->\n<!-- /wp:post-template -->\n<!-- wp:query-pagination -->\n<!-- wp:query-pagination-previous /-->\n<!-- wp:query-pagination-numbers /-->\n<!-- wp:query-pagination-next /-->\n<!-- /wp:query-pagination --></div>\n<!-- /wp:query -->\n\n<!-- wp:template-part {"slug":"footer","tagName":"footer","area":"footer"} /-->',
			'<!-- wp:template-part {"slug":"header","tagName":"header","area":"header"} /-->\n\n<!-- wp:post-title /-->\n<!-- wp:post-featured-image /-->\n<!-- wp:post-content /-->\n<!-- wp:post-terms {"term":"category"} /-->\n<!-- wp:comments /-->\n\n<!-- wp:template-part {"slug":"footer","tagName":"footer","area":"footer"} /-->'
		]
	},
	{
		name: 'title',
		description: 'Display title (defaults to slug)',
		type: 'text',
		required: false,
		samples: ['Home', 'Single Post', 'Page', 'Archive']
	}
];
