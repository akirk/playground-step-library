# `muPlugin` Step

Add code for a plugin.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=muPlugin)**

[View Source](../../steps/muPlugin.ts) to understand how this step is implemented.

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
                "code": "<?php echo \"Hello World\"; ?>"
          }
    }
```

### Advanced Usage
```json
{
          "step": "muPlugin",
          "vars": {
                "name": "custom-hooks",
                "code": "<?php echo \"Hello World\"; ?>"
          }
    }
```

## Compiled Output

### Blueprint V1

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

### Blueprint V2

```json
{
  "version": 2,
  "muPlugins": [
    {
      "file": {
        "filename": "my-plugin-0.php",
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
                "code": "<?php echo \"Hello World\"; ?>"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

