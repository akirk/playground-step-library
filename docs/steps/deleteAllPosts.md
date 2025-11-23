# `deleteAllPosts` Step

Delete all posts, pages, attachments, revisions and menu items.

**[View Source](../../steps/deleteAllPosts.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "deleteAllPosts"
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php';\nforeach ( array( 'post', 'page...",
      "progress": {
        "caption": "Deleting all posts and pages"
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
        "content": "\n<?php require_once '/wordpress/wp-load.php';\nforeach ( array( 'post', 'page', 'attachment', 'revision', 'nav_menu_item' ) as $post_type ) {\n$posts = get_posts( array('posts_per_page' => -1, 'post_type' => $post_type ) );\nforeach ($posts as $post) wp_delete_post($post->ID, true);\n}\n"
      },
      "progress": {
        "caption": "Deleting all posts and pages"
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
          "step": "deleteAllPosts"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

