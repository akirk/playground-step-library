# `setSiteOption` Step

Set a site option.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=setSiteOption)**

[View Source](../../steps/setSiteOption.ts) to understand how this step is implemented.

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

