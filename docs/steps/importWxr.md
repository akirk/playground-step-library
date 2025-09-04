# `importWxr` Step

No description available.

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WXR file |
| `corsProxy` | boolean | ✅ Yes | Use a cors proxy for the request |


## Examples

### Basic Usage
```json
    {
          "step": "importWxr",
          "url": "",
          "corsProxy": "true"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "importWxr",
          "url": "",
          "corsProxy": "true"
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
          "url": "",
          "corsProxy": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
