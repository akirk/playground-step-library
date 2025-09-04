# `addPage` Step

No description available.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `postTitle` | string | ✅ Yes | The title of the post |
| `postContent` | textarea | ✅ Yes | The HTML of the post |
| `homepage` | boolean | ❌ No | Set it as the Homepage |


## Examples

### Basic Usage
```json
    {
          "step": "addPage",
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
          "homepage": "true"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addPage",
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
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
          "postTitle": "Hello World",
          "postContent": "<p>Hello World</p>",
          "homepage": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
