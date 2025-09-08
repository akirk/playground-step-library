# `addPage` Step

Add a page with title and content.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the page |
| `content` | textarea | ✅ Yes | The HTML content of the page |
| `homepage` | boolean | ❌ No | Set it as the Homepage |


## Examples

### Basic Usage
```json
    {
          "step": "addPage",
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "homepage": "true"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addPage",
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "homepage": "true"
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
          "step": "addPage",
          "title": "Hello World",
          "content": "<p>Hello World</p>",
          "homepage": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

## Deprecated Parameters

The following parameters are deprecated but still supported for backward compatibility:

- `postTitle` → Use `title` instead
- `postContent` → Use `content` instead



---

*This documentation was auto-generated from the step definition.*
