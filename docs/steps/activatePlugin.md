# `activatePlugin` Step

Path to the plugin directory as absolute path.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=activatePlugin)**

[View Source](../../steps/activatePlugin.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`activatePlugin`](../builtin-step-usage.md#activateplugin)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `pluginPath` | string | ✅ Yes | Path to the plugin directory as absolute path |
| `pluginName` | string | ❌ No | No description |


## Examples

### Basic Usage
```json
    {
          "step": "activatePlugin",
          "vars": {
                "pluginPath": "/example/path"
          }
    }
```

### Advanced Usage
```json
{
          "step": "activatePlugin",
          "vars": {
                "pluginPath": "/example/path",
                "pluginName": "example-name"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "activatePlugin"
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
      "step": "activatePlugin"
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
          "step": "activatePlugin",
          "vars": {
                "pluginPath": "/example/path",
                "pluginName": "example-name"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

