# `setSiteOption` Step

Set a site option.

**[View Source](../../steps/setSiteOption.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`setSiteOption`](../builtin-step-usage.md#setsiteoption)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ❌ No | Option name |
| `value` | string | ❌ No | Option value |


## Examples

### Basic Usage
```json
    {
          "step": "setSiteOption"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "setSiteOption",
      "name": "",
      "value": ""
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "setSiteOption",
          "vars": {
                "name": "",
                "value": ""
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

