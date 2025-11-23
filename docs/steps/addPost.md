# `addPost` Step

Add a post with title, content, type, status, and date.

**[View Source](../../steps/addPost.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the post |
| `content` | textarea | ✅ Yes | The HTML content of the post |
| `date` | string | ❌ No | The date of the post (optional) |
| `type` | string | ✅ Yes | The post type |
| `status` | string | ❌ No | The post status |
| `postId` | text | ❌ No | Post ID to use (optional) |
| `landingPage` | boolean | ❌ No | Set landing page to the post editor (requires postId) |
| `registerPostType` | button | ❌ No | Register custom post type if needed |


## Examples

### Basic Usage
```json
    {
          "step": "addPost",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>",
                "type": "post"
          }
    }
```

### Advanced Usage
```json
{
          "step": "addPost",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>",
                "date": "2024-01-01 00:00:00",
                "type": "page",
                "status": "draft",
                "postId": "1000",
                "landingPage": true,
                "registerPostType": "example-value"
          }
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php';\n$page_args = array(\n'post_type...",
      "progress": {
        "caption": "addPost:"
      }
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "content": [
    {
      "type": "posts",
      "source": {
        "post_title": "",
        "post_content": "",
        "post_status": "publish"
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
          "step": "addPost",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>",
                "date": "now",
                "type": "post",
                "status": "publish",
                "postId": "",
                "landingPage": false,
                "registerPostType": "example-value"
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
- `postDate` → Use `date` instead
- `postType` → Use `type` instead
- `postStatus` → Use `status` instead

