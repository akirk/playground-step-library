# `rm` Step

Remove a file.

**[View Source](../../steps/rm.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`rm`](../builtin-step-usage.md#rm)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ Yes | Path to the file to remove |


## Examples

### Basic Usage
```json
    {
          "step": "rm",
          "path": "/example/path"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "rm",
      "path": "/example/path"
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
      "step": "rm",
      "path": "/example/path"
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
          "step": "rm",
          "path": "/example/path"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

