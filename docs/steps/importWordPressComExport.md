# `importWordPressComExport` Step

Import a WordPress.com export file (WXR in a ZIP)

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WordPress.com export ZIP file |


## Examples

### Basic Usage
```json
    {
          "step": "importWordPressComExport",
          "url": ""
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "importWordPressComExport",
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
          "step": "importWordPressComExport",
          "url": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
