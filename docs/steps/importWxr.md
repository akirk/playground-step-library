# `importWxr` Step

Import a WXR from a URL.

**[View Source](../../steps/importWxr.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`importWxr`](../builtin-step-usage.md#importwxr)

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

## Compiled Output

### Blueprint V1

```json
{
  "steps": [
    {
      "step": "importWxr",
      "url": ""
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2
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

