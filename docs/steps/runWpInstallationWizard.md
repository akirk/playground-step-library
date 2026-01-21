# `runWpInstallationWizard` Step

Installs WordPress.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=runWpInstallationWizard)**

[View Source](../../steps/runWpInstallationWizard.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`runWpInstallationWizard`](../builtin-step-usage.md#runwpinstallationwizard)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `options` | string | ✅ Yes | Installation options (adminUsername, adminPassword) |


## Examples

### Basic Usage
```json
    {
          "step": "runWpInstallationWizard",
          "vars": {
                "options": "example-value"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "runWpInstallationWizard"
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
      "step": "runWpInstallationWizard"
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
          "step": "runWpInstallationWizard",
          "vars": {
                "options": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

