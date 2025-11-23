# `renameDefaultCategory` Step

Change the default "Uncategorized".

**[View Source](../../steps/renameDefaultCategory.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `categoryName` | string | ✅ Yes | Change the default category name |
| `categorySlug` | string | ✅ Yes | Change the default category slug |


## Examples

### Basic Usage
```json
    {
          "step": "renameDefaultCategory",
          "vars": {
                "categoryName": "example-name",
                "categorySlug": "example-value"
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
          "step": "renameDefaultCategory",
          "vars": {
                "categoryName": "example-name",
                "categorySlug": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

