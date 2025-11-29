# `addPost` Step

Add a post with title, content, type, status, and date.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=addPost)**

[View Source](../../steps/addPost.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the post |
| `content` | textarea | ✅ Yes | The HTML content of the post |
| `date` | string | ❌ No | The date of the post (optional) |
| `type` | string | ❌ No | The post type |
| `status` | string | ❌ No | The post status |
| `postId` | text | ❌ No | Post ID to use (optional) |
| `landingPage` | boolean | ❌ No | Set landing page to the post editor (requires postId) |
| `frontendLandingPage` | boolean | ❌ No | Set landing page to the post on the frontend (requires postId) |
| `registerPostType` | button | ❌ No | Register custom post type if needed |


## Examples

### Basic Usage
```json
    {
          "step": "addPost",
          "vars": {
                "title": "Hello World",
                "content": "<p>Hello World</p>"
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
                "frontendLandingPage": true,
                "registerPostType": "example-value"
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
        "caption": "addPost: Hello World"
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
        "post_type": "post",
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
                "postId": "1000",
                "landingPage": false,
                "frontendLandingPage": false,
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

