# `defineWpConfigConst` Step

Define a wp-config PHP constant.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=defineWpConfigConst)**

[View Source](../../steps/defineWpConfigConst.ts) to understand how this step is implemented.

## Type
🔧 **Built-in Step**

**Compiles to:** [`defineWpConfigConsts`](../builtin-step-usage.md#definewpconfigconsts)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ Yes | Constant name |
| `value` | string | ✅ Yes | Constant value |


## Examples

### Basic Usage
```json
    {
          "step": "defineWpConfigConst",
          "vars": {
                "name": "WP_DEBUG",
                "value": "true"
          }
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
        "WP_DEBUG": true
      }
    }
  ]
}
```

### Blueprint V2

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
          "vars": {
                "name": "WP_DEBUG",
                "value": "true"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

