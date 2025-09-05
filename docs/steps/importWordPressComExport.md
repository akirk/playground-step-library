# `importWordPressComExport` Step

Import a WordPress.com export file (WXR in a ZIP)

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WordPress.com export ZIP file |
| `corsProxy` | boolean | ✅ Yes | Use a cors proxy for the request |


## Examples

### Basic Usage
```json
    {
          "step": "importWordPressComExport",
          "url": "",
          "corsProxy": "true"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "importWordPressComExport",
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
          "step": "importWordPressComExport",
          "url": "",
          "corsProxy": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
