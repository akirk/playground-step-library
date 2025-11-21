import type { StepFunction, SetTT4HomepageStep, StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';
import { addTemplate } from './addTemplate.js';

const homeTemplateContent = `<!-- wp:template-part {"slug":"header","theme":"twentytwentyfour","tagName":"header","area":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"blockGap":"0","margin":{"top":"0"},"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20"}}},"layout":{"type":"default"}} -->
<main class="wp-block-group" style="margin-top:0;padding-right:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:query {"queryId":5,"query":{"perPage":"30","pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title {"isLink":true} /-->

<!-- wp:post-date /-->
<!-- /wp:post-template -->

<!-- wp:query-pagination -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results -->
<!-- wp:paragraph {"placeholder":"Add text or blocks that will display when a query returns no results."} -->
<p></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:query --></main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","theme":"twentytwentyfour","tagName":"footer","area":"footer"} /-->`;

export const setTT4Homepage: StepFunction<SetTT4HomepageStep> = ( step: SetTT4HomepageStep ): StepResult => {
	return {
		toV1() {
			const templateResult = addTemplate( {
				step: 'addTemplate',
				slug: 'home',
				theme: 'twentytwentyfour',
				title: 'Home',
				content: homeTemplateContent
			} );

			const v1Result = templateResult.toV1();

			if ( v1Result.steps && v1Result.steps[0] ) {
				v1Result.steps[0].progress = {
					caption: 'Setting up Twenty Twenty-Four homepage'
				};
			}

			return v1Result;
		},

		toV2() {
			return v1ToV2Fallback( this.toV1() );
		}
	};
};

setTT4Homepage.description = "Set the homepage for the twentytwentyfour theme.";
setTT4Homepage.vars = [];
