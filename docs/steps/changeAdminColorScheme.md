# `changeAdminColorScheme` Step

Useful to combine with a login step.

**[View Source](../../steps/changeAdminColorScheme.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `updateUserMeta`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `colorScheme` | string | ✅ Yes | Color scheme |


## Examples

### Basic Usage
```json
    {
          "step": "changeAdminColorScheme",
          "colorScheme": "modern"
    }
```

## Compiled Output

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

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "changeAdminColorScheme",
          "colorScheme": "modern"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

