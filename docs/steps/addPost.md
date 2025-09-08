# `addPost` Step

Add a post with title, content, type, status, and date.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the post |
| `content` | textarea | ✅ Yes | The HTML content of the post |
| `date` | string | ❌ No | The date of the post (optional) |
| `type` | string | ✅ Yes | The post type |
| `status` | string | ❌ No | The post status |
| `registerPostType` | button | ❌ No | Register custom post type if needed |


## Examples

### Basic Usage
```json
    {
          "step": "addPost",
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "date": "now",
          "type": "post",
          "status": "publish",
          "registerPostType": "example-value"
    }
```

### Advanced Usage
```json
{
  "step": "addPost",
  "title": "Hello World",
  "content": "<p>Hello World</p>",
  "date": "2024-01-01 00:00:00",
  "type": "page",
  "status": "draft",
  "registerPostType": "example-value"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addPost",
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "date": "now",
          "type": "post",
          "status": "publish",
          "registerPostType": "example-value"
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
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "date": "now",
          "type": "post",
          "status": "publish",
          "registerPostType": "example-value"
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



---

*This documentation was auto-generated from the step definition.*
