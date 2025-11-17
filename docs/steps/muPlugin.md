# `muPlugin` Step

Add code for a plugin.

**[View Source](../../steps/muPlugin.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | text | ❌ No | Name for your mu-plugin file |
| `code` | textarea | ✅ Yes | Code for your mu-plugin |


## Examples

### Basic Usage
```json
    {
          "step": "muPlugin",
          "name": "my-plugin",
          "code": ""
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
      "path": "/wordpress/wp-content/mu-plugins/my-plugin-0.php",
      "data": "<?php"
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
          "step": "muPlugin",
          "name": "my-plugin",
          "code": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

