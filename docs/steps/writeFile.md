# `writeFile` Step

Write content to a file.

**[View Source](../../steps/writeFile.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`writeFile`](../builtin-step-usage.md#writefile)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | ✅ Yes | Path to the file to write |
| `data` | textarea | ✅ Yes | Content to write to the file |


## Examples

### Basic Usage
```json
    {
          "step": "writeFile",
          "path": "/example/path",
          "data": "example-value"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "writeFile",
      "path": "/example/path",
      "data": "example-value"
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
      "step": "writeFile",
      "path": "/example/path",
      "data": "example-value"
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
          "step": "writeFile",
          "path": "/example/path",
          "data": "example-value"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

