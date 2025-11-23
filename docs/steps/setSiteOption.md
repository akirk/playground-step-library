# `setSiteOption` Step

Set a site option.

**[View Source](../../steps/setSiteOption.ts)**

## Type
🔧 **Built-in Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ❌ No | Option name |
| `value` | string | ❌ No | Option value |


## Examples

### Basic Usage
```json
    {
          "step": "setSiteOption"
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "setSiteOption",
          "vars": {
                "name": "permalink_structure",
                "value": "/%postname%/"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

