# `setLanguage` Step

Set the WordPress site language.

**[View Source](../../steps/setLanguage.ts)**

## Type
⚡ **Custom Step**


## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `language` | string | ✅ Yes | A valid WordPress language slug |


## Examples

### Basic Usage
```json
    {
          "step": "setLanguage",
          "language": "de"
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "setLanguage",
          "language": "de"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

