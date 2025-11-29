# `jetpackOfflineMode` Step

Start Jetpack in Offline mode.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=jetpackOfflineMode)**

[View Source](../../steps/jetpackOfflineMode.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`defineWpConfigConsts`](../builtin-step-usage.md#definewpconfigconsts), [`setSiteOptions`](../builtin-step-usage.md#setsiteoptions)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `blocks` | boolean | ❌ No | Activate the Jetpack Blocks module. |
| `subscriptions` | boolean | ❌ No | Activate the Jetpack Subscriptions module. |


## Examples

### Basic Usage
```json
    {
          "step": "jetpackOfflineMode"
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
        "JETACK_DEBUG": "true",
        "JETPACK_DEV_DEBUG": "true",
        "DNS_NS": 0
      }
    },
    {
      "step": "setSiteOptions",
      "options": {
        "jetpack_active_modules": [
          "blocks",
          "subscriptions"
        ]
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "siteOptions": {
    "jetpack_active_modules": [
      "blocks",
      "subscriptions"
    ]
  },
  "constants": {
    "JETACK_DEBUG": "true",
    "JETPACK_DEV_DEBUG": "true",
    "DNS_NS": 0
  }
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "jetpackOfflineMode",
          "vars": {
                "blocks": true,
                "subscriptions": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

