# `setTT4Homepage` Step

Set the homepage for the twentytwentyfour theme.

**[View Source](../../steps/setTT4Homepage.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "setTT4Homepage"
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
        "caption": "Setting up Twenty Twenty-Four homepage"
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
        "content": "<?php\nrequire_once '/wordpress/wp-load.php';\n\n$theme_slug = '';\nif ( empty( $theme_slug ) ) {\n\t$theme_slug = get_stylesheet();\n}\n$term = get_term_by( 'slug', $theme_slug, 'wp_theme' );\nif ( ! $term ) {\n\t$term = wp_insert_term( $theme_slug, 'wp_theme' );\n\t$term_id = $term['term_id'];\n} else {\n\t$term_id = $term->term_id;\n}\n\n$post_id = wp_insert_post( array(\n\t'post_title'   => '',\n\t'post_name'    => '',\n\t'post_type'    => 'wp_template',\n\t'post_status'  => 'publish',\n\t'post_content' => '',\n\t'tax_input'    => array(\n\t\t'wp_theme' => array( $term_id )\n\t),\n) );\n\nif ( ! is_wp_error( $post_id ) ) {\n\twp_set_object_terms( $post_id, $term_id, 'wp_theme' );\n}\n"
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

