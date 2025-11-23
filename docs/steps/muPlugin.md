# `muPlugin` Step

Add code for a plugin.

**[View Source](../../steps/muPlugin.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | text | ❌ No | Name for your mu-plugin file |
| `code` | textarea | ✅ Yes | Code for your mu-plugin |


## Examples

### Basic Usage
```json
    {
          "step": "muPlugin",
          "vars": {
                "code": ""
          }
    }
```

### Advanced Usage
```json
{
          "step": "muPlugin",
          "vars": {
                "name": "custom-hooks",
                "code": ""
          }
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
      "path": "/wordpress/wp-content/mu-plugins/mu-plugin-0.php",
      "data": "<?php"
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
        "filename": "mu-plugin.php",
        "content": "<?php "
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
          "step": "muPlugin",
          "vars": {
                "name": "my-plugin",
                "code": ""
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

