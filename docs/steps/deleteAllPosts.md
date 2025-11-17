# `deleteAllPosts` Step

Delete all posts, pages, attachments, revisions and menu items.

**[View Source](../../steps/deleteAllPosts.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "deleteAllPosts"
    }
```

## Compiled Output

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

