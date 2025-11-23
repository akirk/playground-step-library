# `debug` Step

Configure WordPress debug settings and optionally install Query Monitor plugin.

**[View Source](../../steps/debug.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`defineWpConfigConsts`](../builtin-step-usage.md#definewpconfigconsts), [`installPlugin`](../builtin-step-usage.md#installplugin)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `wpDebug` | boolean | ❌ No | Enable WordPress debug mode |
| `wpDebugDisplay` | boolean | ❌ No | Display errors in HTML output. Only applies when the above is enabled. |
| `scriptDebug` | boolean | ❌ No | Use non-minified JavaScript and CSS files. |
| `queryMonitor` | boolean | ❌ No | Install Query Monitor plugin. |


## Examples

### Basic Usage
```json
    {
          "step": "debug"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "defineWpConfigConsts",
      "consts": {
        "WP_DEBUG": true,
        "WP_DEBUG_DISPLAY": true
      }
    },
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "wordpress.org/plugins",
        "slug": "query-monitor"
      },
      "options": {
        "activate": true
      }
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
      "step": "defineWpConfigConsts",
      "consts": {
        "WP_DEBUG": true,
        "WP_DEBUG_DISPLAY": true
      }
    },
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "wordpress.org/plugins",
        "slug": "query-monitor"
      },
      "options": {
        "activate": true
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
          "step": "debug",
          "vars": {
                "wpDebug": false,
                "wpDebugDisplay": false,
                "scriptDebug": false,
                "queryMonitor": false
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

