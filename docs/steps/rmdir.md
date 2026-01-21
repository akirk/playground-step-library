# `rmdir` Step

The path to remove.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=rmdir)**

[View Source](../../steps/rmdir.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`rmdir`](../builtin-step-usage.md#rmdir)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "rmdir",
          "vars": {
                "path": "/example/path"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "rmdir"
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
      "step": "rmdir"
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
          "vars": {
                "path": "/example/path"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

