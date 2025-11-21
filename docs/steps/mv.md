# `mv` Step

Move a file or directory.

**[View Source](../../steps/mv.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mv`](../builtin-step-usage.md#mv)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromPath` | string | ✅ Yes | Source path |
| `toPath` | string | ✅ Yes | Destination path |


## Examples

### Basic Usage
```json
    {
          "step": "mv",
          "fromPath": "/example/path",
          "toPath": "/example/path"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "mv",
      "fromPath": "/example/path",
      "toPath": "/example/path"
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
      "step": "mv",
      "fromPath": "/example/path",
      "toPath": "/example/path"
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
          "step": "mv",
          "fromPath": "/example/path",
          "toPath": "/example/path"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

