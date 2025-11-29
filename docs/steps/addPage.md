# `addPage` Step

Add a page with title and content.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=addPage)**

[View Source](../../steps/addPage.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the page |
| `content` | textarea | ✅ Yes | The HTML content of the page |
| `homepage` | boolean | ❌ No | Set it as the Homepage |


## Examples

### Basic Usage
```json
    {
          "step": "addPage",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>"
          }
    }
```

### Advanced Usage
```json
{
          "step": "addPage",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>",
                "homepage": true
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
      "code": "<?php require_once '/wordpress/wp-load.php';\n$page_args = array(\n'post_type...",
      "progress": {
        "caption": "addPage: Hello World"
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "content": [
    {
      "type": "posts",
      "source": {
        "post_title": "Hello World",
        "post_content": "<p>Hello World</p>",
        "post_type": "page",
        "post_status": "publish"
      }
    }
  ],
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": {
        "filename": "set-homepage.php",
        "content": "<?php\nrequire_once '/wordpress/wp-load.php';\n$pages = get_posts( array(\n\t'post_type' => 'page',\n\t'title' => 'Hello World',\n\t'posts_per_page' => 1,\n\t'orderby' => 'ID',\n\t'order' => 'DESC'\n) );\nif ( ! empty( $pages ) ) {\n\tupdate_option( 'page_on_front', $pages[0]->ID );\n\tupdate_option( 'show_on_front', 'page' );\n}"
      }
    }
  ],
  "siteOptions": {
    "show_on_front": "page"
  }
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "addPage",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>",
                "homepage": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

## Deprecated Parameters

The following parameters are deprecated but still supported for backward compatibility:

- `postTitle` → Use `title` instead
- `postContent` → Use `content` instead

