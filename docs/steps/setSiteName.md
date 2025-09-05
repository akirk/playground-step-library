# `setSiteName` Step

Set the site name and tagline.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sitename` | string | ✅ Yes | Name of the site |
| `tagline` | string | ✅ Yes | What the site is about |


## Examples

### Basic Usage
```json
    {
          "step": "setSiteName",
          "sitename": "Step Library Demo",
          "tagline": "Trying out WordPress Playground."
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "setSiteName",
          "sitename": "Step Library Demo",
          "tagline": "Trying out WordPress Playground."
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
          "step": "setSiteName",
          "sitename": "Step Library Demo",
          "tagline": "Trying out WordPress Playground."
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
