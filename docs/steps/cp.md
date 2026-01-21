# `cp` Step

Source path.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=cp)**

[View Source](../../steps/cp.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`cp`](../builtin-step-usage.md#cp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `fromPath` | string | ✅ Yes | No description |
| `toPath` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "cp",
          "vars": {
                "fromPath": "/example/path",
                "toPath": "/example/path"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "cp"
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
      "step": "cp"
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
          "step": "cp",
          "vars": {
                "fromPath": "/example/path",
                "toPath": "/example/path"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

