# `sampleContent` Step

Inserts sample pages to the site.

**[View Source](../../steps/sampleContent.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "sampleContent"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_tit...",
      "progress": {
        "caption": "Creating sample content (1/5)"
      }
    },
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_tit...",
      "progress": {
        "caption": "Creating sample content (2/5)"
      }
    },
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_tit...",
      "progress": {
        "caption": "Creating sample content (3/5)"
      }
    },
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_tit...",
      "progress": {
        "caption": "Creating sample content (4/5)"
      }
    },
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_tit...",
      "progress": {
        "caption": "Creating sample content (5/5)"
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
          "step": "sampleContent"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

