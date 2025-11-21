# `setTT4Homepage` Step

Set the homepage for the twentytwentyfour theme.

**[View Source](../../steps/setTT4Homepage.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "setTT4Homepage"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php\nrequire_once '/wordpress/wp-load.php';\n$theme_slug = 'twentytwentyfou...",
      "progress": {
        "caption": "Setting up Twenty Twenty-Four homepage"
      }
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php\nrequire_once '/wordpress/wp-load.php';\n\n$theme_slug = 'twentytwentyfour';\nif ( empty( $theme_slug ) ) {\n\t$theme_slug = get_stylesheet();\n}\n$term = get_term_by( 'slug', $theme_slug, 'wp_theme' );\nif ( ! $term ) {\n\t$term = wp_insert_term( $theme_slug, 'wp_theme' );\n\t$term_id = $term['term_id'];\n} else {\n\t$term_id = $term->term_id;\n}\n\n$post_id = wp_insert_post( array(\n\t'post_title'   => 'Home',\n\t'post_name'    => 'home',\n\t'post_type'    => 'wp_template',\n\t'post_status'  => 'publish',\n\t'post_content' => '<!-- wp:template-part {\"slug\":\"header\",\"theme\":\"twentytwentyfour\",\"tagName\":\"header\",\"area\":\"header\"} /-->\n\n<!-- wp:group {\"tagName\":\"main\",\"style\":{\"spacing\":{\"blockGap\":\"0\",\"margin\":{\"top\":\"0\"},\"padding\":{\"right\":\"var:preset|spacing|20\",\"left\":\"var:preset|spacing|20\"}}},\"layout\":{\"type\":\"default\"}} -->\n<main class=\"wp-block-group\" style=\"margin-top:0;padding-right:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)\"><!-- wp:query {\"queryId\":5,\"query\":{\"perPage\":\"30\",\"pages\":0,\"offset\":0,\"postType\":\"post\",\"order\":\"desc\",\"orderBy\":\"date\",\"author\":\"\",\"search\":\"\",\"exclude\":[],\"sticky\":\"\",\"inherit\":false}} -->\n<div class=\"wp-block-query\"><!-- wp:post-template -->\n<!-- wp:post-title {\"isLink\":true} /-->\n\n<!-- wp:post-date /-->\n<!-- /wp:post-template -->\n\n<!-- wp:query-pagination -->\n<!-- wp:query-pagination-previous /-->\n\n<!-- wp:query-pagination-numbers /-->\n\n<!-- wp:query-pagination-next /-->\n<!-- /wp:query-pagination -->\n\n<!-- wp:query-no-results -->\n<!-- wp:paragraph {\"placeholder\":\"Add text or blocks that will display when a query returns no results.\"} -->\n<p></p>\n<!-- /wp:paragraph -->\n<!-- /wp:query-no-results --></div>\n<!-- /wp:query --></main>\n<!-- /wp:group -->\n\n<!-- wp:template-part {\"slug\":\"footer\",\"theme\":\"twentytwentyfour\",\"tagName\":\"footer\",\"area\":\"footer\"} /-->',\n\t'tax_input'    => array(\n\t\t'wp_theme' => array( $term_id )\n\t),\n) );\n\nif ( ! is_wp_error( $post_id ) ) {\n\twp_set_object_terms( $post_id, $term_id, 'wp_theme' );\n}\n"
      },
      "progress": {
        "caption": "Setting up Twenty Twenty-Four homepage"
      }
    }
  ]
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "setTT4Homepage"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

