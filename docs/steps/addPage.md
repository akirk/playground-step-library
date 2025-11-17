# `addPage` Step

Add a page with title and content.

**[View Source](../../steps/addPage.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

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

## Compiled Output

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

