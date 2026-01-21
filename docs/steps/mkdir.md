# `mkdir` Step

The path of the directory you want to create.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=mkdir)**

[View Source](../../steps/mkdir.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "mkdir",
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
      "step": "mkdir"
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
      "step": "mkdir"
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
          "vars": {
                "path": "/example/path"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

