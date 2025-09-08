# `doAction` Step

Execute a custom action.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | text | ✅ Yes | Execute a custom action. |
| `parameter1` | text | ❌ No | First parameter for the action. |
| `parameter2` | text | ❌ No | Second parameter for the action. |
| `parameter3` | text | ❌ No | Third parameter for the action. |
| `parameter4` | text | ❌ No | Fourth parameter for the action. |
| `parameter5` | text | ❌ No | Fifth parameter for the action. |


## Examples

### Basic Usage
```json
    {
          "step": "doAction",
          "action": "",
          "parameter1": "",
          "parameter2": "",
          "parameter3": "",
          "parameter4": "",
          "parameter5": ""
    }
```

### Advanced Usage
```json
{
  "step": "doAction",
  "action": "",
  "parameter1": "",
  "parameter2": "",
  "parameter3": "",
  "parameter4": "",
  "parameter5": ""
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "doAction",
          "action": "",
          "parameter1": "",
          "parameter2": "",
          "parameter3": "",
          "parameter4": "",
          "parameter5": ""
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
          "step": "doAction",
          "action": "",
          "parameter1": "",
          "parameter2": "",
          "parameter3": "",
          "parameter4": "",
          "parameter5": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
