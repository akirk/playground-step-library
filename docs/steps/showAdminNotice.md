# `showAdminNotice` Step

Show an admin notice in the dashboard.

**[View Source](../../steps/showAdminNotice.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`

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
          "dismissible": "true"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/show-admin-notice-0.php",
      "data": "<?php\nadd_action(\n'admin_notices',\nfunction() {\n$dismissed = get_user_optio...",
      "progress": {
        "caption": "Setting up admin notice: Welcome to WordPress Playground!"
      }
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
          "dismissible": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

