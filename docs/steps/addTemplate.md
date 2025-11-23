# `addTemplate` Step

Add a template (home, single, page, etc.) for a block theme.

**[View Source](../../steps/addTemplate.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `slug` | text | ✅ Yes | The template slug (e.g., "home", "single", "page", "archive") |
| `theme` | text | ❌ No | The theme slug (empty = current active theme) |
| `content` | textarea | ✅ Yes | The block markup content |
| `title` | text | ❌ No | Display title (defaults to slug) |


## Examples

### Basic Usage
```json
    {
          "step": "addTemplate",
          "vars": {
                "slug": "home",
                "content": "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\",\"area\":\"header\"} /-->\n\n<!-- wp:post-content /-->\n\n<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\",\"area\":\"footer\"} /-->"
          }
    }
```

### Advanced Usage
```json
{
          "step": "addTemplate",
          "vars": {
                "slug": "single",
                "theme": "twentytwentyfour",
                "content": "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\",\"area\":\"header\"} /-->\n\n<!-- wp:query {\"queryId\":1,\"query\":{\"perPage\":10,\"postType\":\"post\",\"order\":\"desc\",\"orderBy\":\"date\"}} -->\n<div class=\"wp-block-query\"><!-- wp:post-template -->\n<!-- wp:post-title {\"isLink\":true} /-->\n<!-- wp:post-excerpt /-->\n<!-- /wp:post-template -->\n<!-- wp:query-pagination -->\n<!-- wp:query-pagination-previous /-->\n<!-- wp:query-pagination-numbers /-->\n<!-- wp:query-pagination-next /-->\n<!-- /wp:query-pagination --></div>\n<!-- /wp:query -->\n\n<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\",\"area\":\"footer\"} /-->",
                "title": "Single Post"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php\nrequire_once '/wordpress/wp-load.php';\n$theme_slug = '';\nif ( empty( ...",
      "progress": {
        "caption": "addTemplate: home"
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php\nrequire_once '/wordpress/wp-load.php';\n\n$theme_slug = '';\nif ( empty( $theme_slug ) ) {\n\t$theme_slug = get_stylesheet();\n}\n$term = get_term_by( 'slug', $theme_slug, 'wp_theme' );\nif ( ! $term ) {\n\t$term = wp_insert_term( $theme_slug, 'wp_theme' );\n\t$term_id = $term['term_id'];\n} else {\n\t$term_id = $term->term_id;\n}\n\n$post_id = wp_insert_post( array(\n\t'post_title'   => 'Home',\n\t'post_name'    => 'home',\n\t'post_type'    => 'wp_template',\n\t'post_status'  => 'publish',\n\t'post_content' => '<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\",\"area\":\"header\"} /-->\n\n<!-- wp:post-content /-->\n\n<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\",\"area\":\"footer\"} /-->',\n\t'tax_input'    => array(\n\t\t'wp_theme' => array( $term_id )\n\t),\n) );\n\nif ( ! is_wp_error( $post_id ) ) {\n\twp_set_object_terms( $post_id, $term_id, 'wp_theme' );\n}\n"
      },
      "progress": {
        "caption": "addTemplate: home"
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
          "step": "addTemplate",
          "vars": {
                "slug": "home",
                "theme": "twentytwentyfour",
                "content": "<!-- wp:template-part {\"slug\":\"header\",\"tagName\":\"header\",\"area\":\"header\"} /-->\n\n<!-- wp:post-content /-->\n\n<!-- wp:template-part {\"slug\":\"footer\",\"tagName\":\"footer\",\"area\":\"footer\"} /-->",
                "title": "Home"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

