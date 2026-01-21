# `request` Step

Request details (See.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=request)**

[View Source](../../steps/request.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`request`](../builtin-step-usage.md#request)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `request` | string | ✅ Yes | Request details (See |


## Examples

### Basic Usage
```json
    {
          "step": "request",
          "vars": {
                "request": "example-value"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "request"
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
      "step": "request"
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
          "step": "request",
          "vars": {
                "request": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

