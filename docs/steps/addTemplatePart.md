# `addTemplatePart` Step

Add a template part (header, footer, etc.) for a block theme.

**[View Source](../../steps/addTemplatePart.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | text | ✅ Yes | The template part slug (e.g., "header", "footer", "sidebar") |
| `theme` | text | ❌ No | The theme slug (empty = current active theme) |
| `content` | textarea | ✅ Yes | The block markup content |
| `area` | select | ❌ No | The template part area |
| `title` | text | ❌ No | Display title (defaults to slug) |


## Examples

### Basic Usage
```json
    {
          "step": "addTemplatePart",
          "slug": "header",
          "theme": "",
          "content": "<!-- wp:site-title /-->",
          "area": "header",
          "title": "Header"
    }
```

### Advanced Usage
```json
{
  "step": "addTemplatePart",
  "slug": "footer",
  "theme": "twentytwentyfour",
  "content": "<!-- wp:group {\"layout\":{\"type\":\"flex\",\"justifyContent\":\"space-between\"}} -->\n<div class=\"wp-block-group\"><!-- wp:site-title /-->\n<!-- wp:navigation /--></div>\n<!-- /wp:group -->",
  "area": "footer",
  "title": "Footer"
}
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php\nrequire_once '/wordpress/wp-load.php';\n$theme_slug = '';\nif ( empty( ...",
      "progress": {
        "caption": "addTemplatePart: header (header)"
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
        "content": "<?php\nrequire_once '/wordpress/wp-load.php';\n\n$theme_slug = '';\nif ( empty( $theme_slug ) ) {\n\t$theme_slug = get_stylesheet();\n}\n$term = get_term_by( 'slug', $theme_slug, 'wp_theme' );\nif ( ! $term ) {\n\t$term = wp_insert_term( $theme_slug, 'wp_theme' );\n\t$term_id = $term['term_id'];\n} else {\n\t$term_id = $term->term_id;\n}\n\n$post_id = wp_insert_post( array(\n\t'post_title'   => 'Header',\n\t'post_name'    => 'header',\n\t'post_type'    => 'wp_template_part',\n\t'post_status'  => 'publish',\n\t'post_content' => '<!-- wp:site-title /-->',\n\t'tax_input'    => array(\n\t\t'wp_theme' => array( $term_id )\n\t),\n) );\n\nif ( ! is_wp_error( $post_id ) ) {\n\twp_set_object_terms( $post_id, $term_id, 'wp_theme' );\n\tupdate_post_meta( $post_id, 'wp_template_part_area', 'header' );\n}\n"
      },
      "progress": {
        "caption": "addTemplatePart: header (header)"
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
          "step": "addTemplatePart",
          "slug": "header",
          "theme": "",
          "content": "<!-- wp:site-title /-->",
          "area": "header",
          "title": "Header"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

