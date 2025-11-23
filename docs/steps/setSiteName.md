# `setSiteName` Step

Set the site name and tagline.

**[View Source](../../steps/setSiteName.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`setSiteOptions`](../builtin-step-usage.md#setsiteoptions)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `sitename` | string | ✅ Yes | Name of the site |
| `tagline` | string | ✅ Yes | What the site is about |


## Examples

### Basic Usage
```json
    {
          "step": "setSiteName",
          "vars": {
                "sitename": "Step Library Demo",
                "tagline": "Trying out WordPress Playground."
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "setSiteOptions",
      "options": {
        "blogname": "",
        "blogdescription": ""
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "siteOptions": {
    "blogname": "",
    "blogdescription": ""
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
          "step": "setSiteName",
          "vars": {
                "sitename": "Step Library Demo",
                "tagline": "Trying out WordPress Playground."
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

