# `enqueueJs` Step

Enqueue custom JavaScript on frontend and/or admin.

**[View Source](../../steps/enqueueJs.ts)**

## Type
⚡ **Custom Step**


## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the JavaScript file (without .js extension) |
| `js` | textarea | ✅ Yes | JavaScript code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


## Examples

### Basic Usage
```json
    {
          "step": "enqueueJs",
          "filename": "custom-script",
          "js": "",
          "frontend": "true",
          "wpAdmin": "true"
    }
```

### Advanced Usage
```json
{
  "step": "enqueueJs",
  "filename": "interactive-features",
  "js": "",
  "frontend": "true",
  "wpAdmin": "true"
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
          "filename": "custom-script",
          "js": "",
          "frontend": "true",
          "wpAdmin": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

