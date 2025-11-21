# `jetpackOfflineMode` Step

Start Jetpack in Offline mode.

**[View Source](../../steps/jetpackOfflineMode.ts)**

## Type
⚡ **Custom Step**


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

