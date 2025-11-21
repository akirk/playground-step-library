# `activateTheme` Step

Activate an already installed theme.

**[View Source](../../steps/activateTheme.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`activateTheme`](../builtin-step-usage.md#activatetheme)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `themeFolderName` | string | ✅ Yes | The theme folder name in wp-content/themes/ |


## Examples

### Basic Usage
```json
    {
          "step": "activateTheme",
          "themeFolderName": "example-name"
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
  "steps": [
    {
      "step": "activateTheme",
      "themeFolderName": "example-name"
    }
  ]
}
```

### V2 (Declarative)

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "activateTheme",
      "themeFolderName": "example-name"
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
          "themeFolderName": "example-name"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

