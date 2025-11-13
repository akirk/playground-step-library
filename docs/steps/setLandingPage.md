# `setLandingPage` Step

Set the landing page.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `landingPage` | string | ✅ Yes | The relative URL for the landing page |


## Examples

### Basic Usage
```json
    {
          "step": "setLandingPage",
          "landingPage": "/"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "setLandingPage",
          "landingPage": "/"
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
          "step": "setLandingPage",
          "landingPage": "/"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

