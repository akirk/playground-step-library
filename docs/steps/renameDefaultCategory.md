# `renameDefaultCategory` Step

Change the default "Uncategorized".

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=renameDefaultCategory)**

[View Source](../../steps/renameDefaultCategory.ts) to understand how this step is implemented.

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

