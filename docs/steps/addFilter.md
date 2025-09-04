# `addFilter` Step

No description available.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | ✅ Yes | Name of the filter |
| `code` | textarea | ✅ Yes | Code for the filter |
| `priority` | string | ❌ No | Priority of the filter |


## Examples

### Basic Usage
```json
    {
          "step": "addFilter",
          "filter": "init",
          "code": "'__return_false'",
          "priority": "10"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addFilter",
          "filter": "init",
          "code": "'__return_false'",
          "priority": "10"
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
          "step": "addFilter",
          "filter": "init",
          "code": "'__return_false'",
          "priority": "10"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
