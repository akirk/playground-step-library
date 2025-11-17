# `muPlugin` Step

Add code for a plugin.

**[View Source](../../steps/muPlugin.ts)**

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | text | ✅ Yes | Name for your mu-plugin file |
| `code` | textarea | ✅ Yes | Code for your mu-plugin |


## Examples

### Basic Usage
```json
    {
          "step": "muPlugin",
          "name": "my-plugin",
          "code": ""
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "muPlugin",
          "name": "my-plugin",
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
          "name": "my-plugin",
          "code": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

