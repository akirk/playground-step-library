# `defineSiteUrl` Step

Changes the site URL of the WordPress installation.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=defineSiteUrl)**

[View Source](../../steps/defineSiteUrl.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`defineSiteUrl`](../builtin-step-usage.md#definesiteurl)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `siteUrl` | string | ✅ Yes | No description |


## Examples

### Basic Usage
```json
    {
          "step": "defineSiteUrl",
          "vars": {
                "siteUrl": "https://example.com"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "defineSiteUrl"
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "defineSiteUrl"
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
          "step": "defineSiteUrl",
          "vars": {
                "siteUrl": "https://example.com"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

