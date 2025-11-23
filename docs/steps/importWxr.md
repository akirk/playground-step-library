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
                "url": ""
          }
    }
```

## Compiled Output

### V1 (Imperative)

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

### V2 (Declarative)

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
                "url": ""
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

