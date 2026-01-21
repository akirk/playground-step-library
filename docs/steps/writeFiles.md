# `writeFiles` Step

The path of the file to write to.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=writeFiles)**

[View Source](../../steps/writeFiles.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`writeFiles`](../builtin-step-usage.md#writefiles)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `writeToPath` | string | ✅ Yes | No description |
| `filesTree` | string | ✅ Yes | The 'filesTree' defines the directory structure, supporting 'literal:directory' or |


## Examples

### Basic Usage
```json
    {
          "step": "writeFiles",
          "vars": {
                "writeToPath": "/example/path",
                "filesTree": "example-value"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "writeFiles"
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
      "step": "writeFiles"
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
          "step": "writeFiles",
          "vars": {
                "writeToPath": "/example/path",
                "filesTree": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

