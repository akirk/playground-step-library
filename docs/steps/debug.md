# `debug` Step

Configure WordPress debug settings and optionally install Query Monitor plugin.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=debug)**

[View Source](../../steps/debug.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`defineWpConfigConsts`](../builtin-step-usage.md#definewpconfigconsts)

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

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "defineWpConfigConsts",
      "consts": {
        "WP_DEBUG": false
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
      "step": "defineWpConfigConsts",
      "consts": {
        "WP_DEBUG": false
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

