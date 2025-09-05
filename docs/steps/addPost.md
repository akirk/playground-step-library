# `addPost` Step

Add a post.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `postTitle` | string | ✅ Yes | The title of the post |
| `postContent` | textarea | ✅ Yes | The HTML of the post |
| `postDate` | string | ❌ No | The date of the post (optional) |
| `postType` | string | ✅ Yes | The post type |
| `postStatus` | string | ❌ No | The post status |
| `registerPostType` | button | ❌ No | Register custom post type if needed |


## Examples

### Basic Usage
```json
    {
          "step": "addPost",
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
          "postDate": "now",
          "postType": "post",
          "postStatus": "publish",
          "registerPostType": "example-value"
    }
```

### Advanced Usage
```json
{
  "step": "addPost",
  "postTitle": "Hello World",
  "postContent": "<p>Hello World</p>",
  "postDate": "2024-01-01 00:00:00",
  "postType": "page",
  "postStatus": "draft",
  "registerPostType": "example-value"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addPost",
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
          "postDate": "now",
          "postType": "post",
          "postStatus": "publish",
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
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
          "postDate": "now",
          "postType": "post",
          "postStatus": "publish",
          "registerPostType": "example-value"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
