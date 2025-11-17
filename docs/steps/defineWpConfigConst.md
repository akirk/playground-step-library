# `defineWpConfigConst` Step

Define a wp-config PHP constant.

**[View Source](../../steps/defineWpConfigConst.ts)**

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ❌ No | Constant name |
| `value` | string | ❌ No | Constant value |


## Examples

### Basic Usage
```json
    {
          "step": "defineWpConfigConst",
          "name": "WP_DEBUG",
          "value": "true"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "defineWpConfigConst",
          "name": "WP_DEBUG",
          "value": "true"
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
          "step": "defineWpConfigConst",
          "name": "WP_DEBUG",
          "value": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

