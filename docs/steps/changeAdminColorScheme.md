# `changeAdminColorScheme` Step

Useful to combine with a login step.

## Type
⚡ **Custom Step**

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

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "changeAdminColorScheme",
          "colorScheme": "modern"
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

---

*This documentation was auto-generated from the step definition.*
