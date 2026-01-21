# `unzip` Step

The zip file to extract.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=unzip)**

[View Source](../../steps/unzip.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`unzip`](../builtin-step-usage.md#unzip)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `zipFile` | string | ❌ No | No description |
| `extractToPath` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "unzip",
          "vars": {
                "extractToPath": "/example/path"
          }
    }
```

### Advanced Usage
```json
{
          "step": "unzip",
          "vars": {
                "zipFile": "example-value",
                "extractToPath": "/example/path"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "unzip"
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
      "step": "unzip"
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
          "vars": {
                "zipFile": "example-value",
                "extractToPath": "/example/path"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

