# `mkdir` Step

Create a directory.

**[View Source](../../steps/mkdir.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ Yes | Path to the directory to create |


## Examples

### Basic Usage
```json
    {
          "step": "mkdir",
          "path": "/example/path"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "mkdir",
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
      "step": "mkdir",
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
          "step": "mkdir",
          "path": "/example/path"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

