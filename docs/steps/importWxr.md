# `importWxr` Step

Import a WXR from a URL.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=importWxr)**

[View Source](../../steps/importWxr.ts) to understand how this step is implemented.

## Type
🔧 **Built-in Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | ✅ Yes | URL of a WXR file |


## Examples

### Basic Usage
```json
    {
          "step": "importWxr",
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
          "step": "importWxr",
          "vars": {
                "url": "https://example.com"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

