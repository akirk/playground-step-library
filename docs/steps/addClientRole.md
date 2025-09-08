# `addClientRole` Step

Adds a role for clients with additional capabilities than editors, but not quite admin.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `displayName` | string | ✅ Yes | Display name for the client role |


## Examples

### Basic Usage
```json
    {
          "step": "addClientRole",
          "displayName": "Client"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addClientRole",
          "displayName": "Client"
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
          "step": "addClientRole",
          "displayName": "Client"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
