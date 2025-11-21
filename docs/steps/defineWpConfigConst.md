# `defineWpConfigConst` Step

Define a wp-config PHP constant.

**[View Source](../../steps/defineWpConfigConst.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`defineWpConfigConsts`](../builtin-step-usage.md#definewpconfigconsts)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ Yes | Constant name |
| `value` | string | ✅ Yes | Constant value |


## Examples

### Basic Usage
```json
    {
          "step": "defineWpConfigConst",
          "name": "WP_DEBUG",
          "value": "true"
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
        "WP_DEBUG": true
      }
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "constants": {
    "WP_DEBUG": true
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
          "step": "defineWpConfigConst",
          "name": "WP_DEBUG",
          "value": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

