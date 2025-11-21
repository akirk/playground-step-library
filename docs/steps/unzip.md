# `unzip` Step

Extract a zip file.

**[View Source](../../steps/unzip.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`unzip`](../builtin-step-usage.md#unzip)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `zipFile` | string | ❌ No | The zip file resource to extract |
| `zipPath` | string | ❌ No | Path to an existing zip file in the filesystem |
| `extractToPath` | string | ✅ Yes | Path where the zip contents should be extracted |


## Examples

### Basic Usage
```json
    {
          "step": "unzip",
          "zipFile": "example-value",
          "zipPath": "/example/path",
          "extractToPath": "/example/path"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "unzip",
      "extractToPath": "/example/path",
      "zipFile": "example-value",
      "zipPath": "/example/path"
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
      "step": "unzip",
      "extractToPath": "/example/path",
      "zipFile": "example-value",
      "zipPath": "/example/path"
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
          "step": "unzip",
          "zipFile": "example-value",
          "zipPath": "/example/path",
          "extractToPath": "/example/path"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

