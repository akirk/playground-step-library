import type { StepFunction, AddTemplatePartStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const addTemplatePart: StepFunction<AddTemplatePartStep> = ( step: AddTemplatePartStep ): StepResult => {
	const slug = step.slug || '';
	const theme = step.theme || ''; // Empty means current active theme
	const content = step.content || '';
	const area = step.area || 'general';
	const title = step.title || slug;

	return {
		toV1() {
			const escapedSlug = slug.replace( /'/g, "\\'" );
			const escapedTheme = theme.replace( /'/g, "\\'" );
			const escapedContent = content.replace( /'/g, "\\'" );
			const escapedTitle = title.replace( /'/g, "\\'" );
			const escapedArea = area.replace( /'/g, "\\'" );

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
	'post_type'    => 'wp_template_part',
	'post_status'  => 'publish',
	'post_content' => '${escapedContent}',
	'tax_input'    => array(
		'wp_theme' => array( $term_id )
	),
) );

if ( ! is_wp_error( $post_id ) ) {
	wp_set_object_terms( $post_id, $term_id, 'wp_theme' );
	update_post_meta( $post_id, 'wp_template_part_area', '${escapedArea}' );
}
`;

			return {
				steps: [
					{
						step: 'runPHP',
						code,
						progress: {
							caption: `addTemplatePart: ${slug} (${area})`
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

addTemplatePart.description = "Add a template part (header, footer, etc.) for a block theme.";
addTemplatePart.vars = [
	{
		name: 'slug',
		description: 'The template part slug (e.g., "header", "footer", "sidebar")',
		type: 'text',
		required: true,
		samples: ['header', 'footer', 'sidebar']
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
			'<!-- wp:site-title /-->',
			'<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->\n<div class="wp-block-group"><!-- wp:site-title /-->\n<!-- wp:navigation /--></div>\n<!-- /wp:group -->',
			'<!-- wp:post-title {"isLink":true} /-->\n<!-- wp:post-excerpt /-->',
			'<!-- wp:post-featured-image /-->\n<!-- wp:post-title {"isLink":true} /-->\n<!-- wp:post-excerpt /-->\n<!-- wp:post-date /-->',
			'<!-- wp:paragraph -->\n<p>© 2024 My Site</p>\n<!-- /wp:paragraph -->'
		]
	},
	{
		name: 'area',
		description: 'The template part area',
		type: 'select',
		options: ['header', 'footer', 'general'],
		required: false,
		samples: ['header', 'footer', 'general']
	},
	{
		name: 'title',
		description: 'Display title (defaults to slug)',
		type: 'text',
		required: false,
		samples: ['Header', 'Footer', 'Custom Sidebar']
	}
];
