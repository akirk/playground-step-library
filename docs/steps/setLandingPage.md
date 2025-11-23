# `setLandingPage` Step

Set the landing page.

**[View Source](../../steps/setLandingPage.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `landingPage` | string | ✅ Yes | The relative URL for the landing page |


## Examples

### Basic Usage
```json
    {
          "step": "setLandingPage",
          "vars": {
                "landingPage": "/"
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
          "step": "setLandingPage",
          "vars": {
                "landingPage": "/"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

