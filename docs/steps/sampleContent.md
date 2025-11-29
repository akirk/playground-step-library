# `sampleContent` Step

Inserts sample pages to the site.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=sampleContent)**

[View Source](../../steps/sampleContent.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "sampleContent"
    }
```

## Compiled Output

### Blueprint V1

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

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Hello Sample Content', 'post_status' => 'publish')); ?>"
      },
      "progress": {
        "caption": "Creating sample content (1/5)"
      }
    },
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Second Sample Content', 'post_status' => 'publish')); ?>"
      },
      "progress": {
        "caption": "Creating sample content (2/5)"
      }
    },
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Third Sample Content', 'post_status' => 'publish')); ?>"
      },
      "progress": {
        "caption": "Creating sample content (3/5)"
      }
    },
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Fourth Sample Content', 'post_status' => 'publish')); ?>"
      },
      "progress": {
        "caption": "Creating sample content (4/5)"
      }
    },
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Fifth Sample Content', 'post_status' => 'publish')); ?>"
      },
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

