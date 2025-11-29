# `changeAdminColorScheme` Step

Useful to combine with a login step.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=changeAdminColorScheme)**

[View Source](../../steps/changeAdminColorScheme.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`updateUserMeta`](../builtin-step-usage.md#updateusermeta)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `colorScheme` | string | ✅ Yes | Color scheme |


## Examples

### Basic Usage
```json
    {
          "step": "changeAdminColorScheme",
          "vars": {
                "colorScheme": "modern"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "updateUserMeta",
      "meta": {
        "admin_color": "modern"
      },
      "userId": 1
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
      "step": "updateUserMeta",
      "meta": {
        "admin_color": "modern"
      },
      "userId": 1
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
          "step": "changeAdminColorScheme",
          "vars": {
                "colorScheme": "modern"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

