# `enqueueCss` Step

Enqueue custom CSS on frontend and/or admin.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=enqueueCss)**

[View Source](../../steps/enqueueCss.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the CSS file (without .css extension) |
| `css` | textarea | ✅ Yes | CSS code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


## Examples

### Basic Usage
```json
    {
          "step": "enqueueCss",
          "vars": {
                "css": "body { background: #f0f0f0; }"
          }
    }
```

### Advanced Usage
```json
{
          "step": "enqueueCss",
          "vars": {
                "filename": "theme-overrides",
                "css": "body { background: #f0f0f0; }",
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
          "step": "enqueueCss",
          "vars": {
                "filename": "custom-styles",
                "css": "body { background: #f0f0f0; }",
                "frontend": true,
                "wpAdmin": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

