# `setSiteOption` Step

Set a site option.

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ❌ No | Option name |
| `value` | string | ❌ No | Option value |


## Examples

### Basic Usage
```json
    {
          "step": "setSiteOption",
          "name": "",
          "value": ""
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "setSiteOption",
          "name": "",
          "value": ""
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
          "step": "setSiteOption",
          "name": "",
          "value": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

