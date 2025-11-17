# `addFilter` Step

Easily add a filtered value.

**[View Source](../../steps/addFilter.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | ✅ Yes | Name of the filter |
| `code` | textarea | ✅ Yes | Code for the filter |
| `priority` | string | ❌ No | Priority of the filter |


## Examples

### Basic Usage
```json
    {
          "step": "addFilter",
          "filter": "init",
          "code": "'__return_false'",
          "priority": "10"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/addFilter-0.php",
      "data": "<?php add_filter( 'init', '__return_false' );",
      "progress": {
        "caption": "addFilter: init"
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
          "step": "addFilter",
          "filter": "init",
          "code": "'__return_false'",
          "priority": "10"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

