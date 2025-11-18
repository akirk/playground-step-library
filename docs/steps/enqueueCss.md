# `enqueueCss` Step

Enqueue custom CSS on frontend and/or admin.

**[View Source](../../steps/enqueueCss.ts)**

## Type
⚡ **Custom Step**


## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | text | ❌ No | Filename for the CSS file (without .css extension) |
| `css` | textarea | ✅ Yes | CSS code to enqueue |
| `frontend` | boolean | ❌ No | Enqueue on frontend |
| `wpAdmin` | boolean | ❌ No | Enqueue in wp-admin |


## Examples

### Basic Usage
```json
    {
          "step": "enqueueCss",
          "filename": "custom-styles",
          "css": "",
          "frontend": "true",
          "wpAdmin": "true"
    }
```

### Advanced Usage
```json
{
  "step": "enqueueCss",
  "filename": "theme-overrides",
  "css": "",
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
          "step": "enqueueCss",
          "filename": "custom-styles",
          "css": "",
          "frontend": "true",
          "wpAdmin": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

