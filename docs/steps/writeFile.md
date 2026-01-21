# `writeFile` Step

The path of the file to write to.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=writeFile)**

[View Source](../../steps/writeFile.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | string | ✅ Yes | No description |
| `data` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "writeFile",
          "vars": {
                "path": "/example/path",
                "data": "example-value"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "writeFile"
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
      "step": "writeFile"
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
          "vars": {
                "path": "/example/path",
                "data": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

