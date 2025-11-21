# `activatePlugin` Step

Activate an already installed plugin.

**[View Source](../../steps/activatePlugin.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`activatePlugin`](../builtin-step-usage.md#activateplugin)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pluginPath` | string | ✅ Yes | Path to the plugin file relative to wp-content/plugins/ |
| `pluginName` | string | ❌ No | Human-readable plugin name for progress display |


## Examples

### Basic Usage
```json
    {
          "step": "activatePlugin",
          "pluginPath": "/example/path",
          "pluginName": "example-name"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "activatePlugin",
      "pluginPath": "/example/path",
      "pluginName": "example-name"
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "activatePlugin",
      "pluginPath": "/example/path",
      "pluginName": "example-name"
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
          "pluginPath": "/example/path",
          "pluginName": "example-name"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

