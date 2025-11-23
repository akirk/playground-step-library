# `enqueueJs` Step

Enqueue custom JavaScript on frontend and/or admin.

**[View Source](../../steps/enqueueJs.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the JavaScript file (without .js extension) |
| `js` | textarea | ✅ Yes | JavaScript code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


## Examples

### Basic Usage
```json
    {
          "step": "enqueueJs",
          "vars": {
                "js": ""
          }
    }
```

### Advanced Usage
```json
{
          "step": "enqueueJs",
          "vars": {
                "filename": "interactive-features",
                "js": "",
                "frontend": true,
                "wpAdmin": true
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
          "step": "enqueueJs",
          "vars": {
                "filename": "custom-script",
                "js": "",
                "frontend": true,
                "wpAdmin": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

