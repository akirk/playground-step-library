# `setSiteName` Step

Set the site name and tagline.

**[View Source](../../steps/setSiteName.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`setSiteOptions`](../builtin-step-usage.md#setsiteoptions)

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

## Compiled Output

```json
{
  "steps": [
    {
      "step": "setSiteOptions",
      "options": {
        "blogname": "Step Library Demo",
        "blogdescription": "Trying out WordPress Playground."
      }
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

