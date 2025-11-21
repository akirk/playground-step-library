# `jetpackOfflineMode` Step

Start Jetpack in Offline mode.

**[View Source](../../steps/jetpackOfflineMode.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`defineWpConfigConsts`](../builtin-step-usage.md#definewpconfigconsts), [`setSiteOptions`](../builtin-step-usage.md#setsiteoptions)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `blocks` | boolean | ❌ No | Activate the Jetpack Blocks module. |
| `subscriptions` | boolean | ❌ No | Activate the Jetpack Subscriptions module. |


## Examples

### Basic Usage
```json
    {
          "step": "jetpackOfflineMode",
          "blocks": "true",
          "subscriptions": "true"
    }
```

## Compiled Output

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

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "jetpackOfflineMode",
          "blocks": "true",
          "subscriptions": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

