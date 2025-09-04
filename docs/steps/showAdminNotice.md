# `showAdminNotice` Step

No description available.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | ✅ Yes | The notice to be displayed |
| `type` | select | ❌ No | The type of notice |
| `dismissible` | boolean | ❌ No | Allow to dismiss |


## Examples

### Basic Usage
```json
    {
          "step": "showAdminNotice",
          "text": "Welcome to WordPress Playground!",
          "type": "success",
          "dismissible": true
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "showAdminNotice",
          "text": "Welcome to WordPress Playground!",
          "type": "success",
          "dismissible": true
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
          "step": "showAdminNotice",
          "text": "Welcome to WordPress Playground!",
          "type": "success",
          "dismissible": true
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
