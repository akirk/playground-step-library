# `addFilter` Step

Easily add a filtered value.

**[View Source](../../steps/addFilter.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

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

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/addFilter-0-0.php",
      "data": "<?php add_filter( 'init', '__return_false' );"
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "muPlugins": [
    {
      "file": {
        "filename": "addFilter-0.php",
        "content": "<?php add_filter( 'init', '__return_false' );"
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

