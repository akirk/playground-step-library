# `rm` Step

The path to remove.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=rm)**

[View Source](../../steps/rm.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`rm`](../builtin-step-usage.md#rm)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "rm",
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
      "step": "rm"
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
      "step": "rm"
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
          "vars": {
                "path": "/example/path"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

