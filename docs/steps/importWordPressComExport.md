# `importWordPressComExport` Step

Import a WordPress.com export file (WXR in a ZIP)

**[View Source](../../steps/importWordPressComExport.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WordPress.com export ZIP file |


## Examples

### Basic Usage
```json
    {
          "step": "importWordPressComExport",
          "vars": {
                "url": "https://example.com"
          }
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
          "vars": {
                "url": "https://example.com"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

