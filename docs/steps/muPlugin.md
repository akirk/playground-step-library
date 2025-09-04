# `muPlugin` Step

Add code for a plugin.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | textarea | ✅ Yes | Code for your mu-plugin |


## Examples

### Basic Usage
```json
    {
          "step": "muPlugin",
          "code": ""
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "muPlugin",
          "code": ""
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
          "step": "muPlugin",
          "code": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
