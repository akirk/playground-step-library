# `importWxr` Step

Import a WXR from a URL.

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WXR file |


## Examples

### Basic Usage
```json
    {
          "step": "importWxr",
          "url": ""
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "importWxr",
          "url": ""
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
          "step": "importWxr",
          "url": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

