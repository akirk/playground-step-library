# `changeAdminColorScheme` Step

Useful to combine with a login step.

**[View Source](../../steps/changeAdminColorScheme.ts)**

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
      "meta": {},
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
      "meta": {},
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

