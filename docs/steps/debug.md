# `debug` Step

Configure WordPress debug settings and optionally install Query Monitor plugin.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `wpDebug` | boolean | ❌ No | Enable WordPress debug mode |
| `wpDebugDisplay` | boolean | ❌ No | Display errors in HTML output. Only applies when the above is enabled. |
| `scriptDebug` | boolean | ❌ No | Use non-minified JavaScript and CSS files. |
| `queryMonitor` | boolean | ❌ No | Install Query Monitor plugin. |


## Examples

### Basic Usage
```json
    {
          "step": "debug",
          "wpDebug": false,
          "wpDebugDisplay": false,
          "scriptDebug": false,
          "queryMonitor": false
    }
```

### Advanced Usage
```json
{
  "step": "debug",
  "wpDebug": false,
  "wpDebugDisplay": false,
  "scriptDebug": false,
  "queryMonitor": false
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "debug",
          "wpDebug": false,
          "wpDebugDisplay": false,
          "scriptDebug": false,
          "queryMonitor": false
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
          "step": "debug",
          "wpDebug": false,
          "wpDebugDisplay": false,
          "scriptDebug": false,
          "queryMonitor": false
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
