# `importWordPressFiles` Step

The zip file containing the top-level WordPress files and.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=importWordPressFiles)**

[View Source](../../steps/importWordPressFiles.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`importWordPressFiles`](../builtin-step-usage.md#importwordpressfiles)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `wordPressFilesZip` | string | ✅ Yes | The zip file containing the top-level WordPress files and |
| `pathInZip` | string | ❌ No | The path inside the zip file where the WordPress files are. |


## Examples

### Basic Usage
```json
    {
          "step": "importWordPressFiles",
          "vars": {
                "wordPressFilesZip": "example-value"
          }
    }
```

### Advanced Usage
```json
{
          "step": "importWordPressFiles",
          "vars": {
                "wordPressFilesZip": "example-value",
                "pathInZip": "/example/path"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "importWordPressFiles"
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
      "step": "importWordPressFiles"
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
          "step": "importWordPressFiles",
          "vars": {
                "wordPressFilesZip": "example-value",
                "pathInZip": "/example/path"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

