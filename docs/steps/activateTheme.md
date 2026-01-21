# `activateTheme` Step

The name of the theme folder inside wp-content/themes/.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=activateTheme)**

[View Source](../../steps/activateTheme.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`activateTheme`](../builtin-step-usage.md#activatetheme)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `themeFolderName` | string | ✅ Yes | The name of the theme folder inside wp-content/themes/ |


## Examples

### Basic Usage
```json
    {
          "step": "activateTheme",
          "vars": {
                "themeFolderName": "example-name"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "activateTheme"
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
      "step": "activateTheme"
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
          "step": "activateTheme",
          "vars": {
                "themeFolderName": "example-name"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

