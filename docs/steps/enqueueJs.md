# `enqueueJs` Step

Enqueue custom JavaScript on frontend and/or admin.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=enqueueJs)**

[View Source](../../steps/enqueueJs.ts) to understand how this step is implemented.

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
                "js": "console.log('Hello from custom script!');"
          }
    }
```

### Advanced Usage
```json
{
          "step": "enqueueJs",
          "vars": {
                "filename": "interactive-features",
                "js": "console.log('Hello from custom script!');",
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
                "js": "console.log('Hello from custom script!');",
                "frontend": true,
                "wpAdmin": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

