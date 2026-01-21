# `mv` Step

Source path.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=mv)**

[View Source](../../steps/mv.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`mv`](../builtin-step-usage.md#mv)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `fromPath` | string | ✅ Yes | No description |
| `toPath` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "mv",
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
      "step": "mv"
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
      "step": "mv"
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
          "step": "mv",
          "vars": {
                "fromPath": "/example/path",
                "toPath": "/example/path"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

