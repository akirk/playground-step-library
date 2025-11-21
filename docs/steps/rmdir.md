# `rmdir` Step

Remove a directory.

**[View Source](../../steps/rmdir.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`rmdir`](../builtin-step-usage.md#rmdir)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ Yes | Path to the directory to remove |


## Examples

### Basic Usage
```json
    {
          "step": "rmdir",
          "path": "/example/path"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "rmdir",
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
      "step": "rmdir",
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
          "step": "rmdir",
          "path": "/example/path"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

