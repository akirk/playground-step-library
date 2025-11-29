# `setSiteName` Step

Set the site name and tagline.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=setSiteName)**

[View Source](../../steps/setSiteName.ts) to understand how this step is implemented.

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
        "blogname": "Step Library Demo",
        "blogdescription": "Trying out WordPress Playground."
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
    "blogname": "Step Library Demo",
    "blogdescription": "Trying out WordPress Playground."
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

