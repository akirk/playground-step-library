# `renameDefaultCategory` Step

Change the default "Uncategorized".

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryName` | string | ✅ Yes | Change the default category name |
| `categorySlug` | string | ✅ Yes | Change the default category slug |


## Examples

### Basic Usage
```json
    {
          "step": "renameDefaultCategory",
          "categoryName": "",
          "categorySlug": ""
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "renameDefaultCategory",
          "categoryName": "",
          "categorySlug": ""
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
          "step": "renameDefaultCategory",
          "categoryName": "",
          "categorySlug": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
