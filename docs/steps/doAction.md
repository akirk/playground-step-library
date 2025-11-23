# `doAction` Step

Execute a custom action.

**[View Source](../../steps/doAction.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
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
          "vars": {
                "action": ""
          }
    }
```

### Advanced Usage
```json
{
          "step": "doAction",
          "vars": {
                "action": "",
                "parameter1": "",
                "parameter2": "",
                "parameter3": "",
                "parameter4": "",
                "parameter5": ""
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
          "step": "doAction",
          "vars": {
                "action": "",
                "parameter1": "",
                "parameter2": "",
                "parameter3": "",
                "parameter4": "",
                "parameter5": ""
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

