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
                "action": "example-value"
          }
    }
```

### Advanced Usage
```json
{
          "step": "doAction",
          "vars": {
                "action": "example-value",
                "parameter1": "example-value",
                "parameter2": "example-value",
                "parameter3": "example-value",
                "parameter4": "example-value",
                "parameter5": "example-value"
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
                "action": "example-value",
                "parameter1": "example-value",
                "parameter2": "example-value",
                "parameter3": "example-value",
                "parameter4": "example-value",
                "parameter5": "example-value"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

