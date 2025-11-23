# `showAdminNotice` Step

Show an admin notice in the dashboard.

**[View Source](../../steps/showAdminNotice.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | string | ✅ Yes | The notice to be displayed |
| `type` | select | ❌ No | The type of notice |
| `dismissible` | boolean | ❌ No | Allow to dismiss |


## Examples

### Basic Usage
```json
    {
          "step": "showAdminNotice",
          "vars": {
                "text": "Welcome to WordPress Playground!"
          }
    }
```

### Advanced Usage
```json
{
          "step": "showAdminNotice",
          "vars": {
                "text": "This is a demo of the Step Library",
                "type": "success",
                "dismissible": true
          }
    }
```

## Compiled Output

### Blueprint V1

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
      "data": "<?php \nadd_action(\n'admin_notices',\nfunction() {\necho '<div class=\"notice n..."
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "muPlugins": [
    {
      "file": {
        "filename": "show-admin-notice-0.php",
        "content": "<?php \nadd_action(\n\t'admin_notices',\n\tfunction() {\n\t\t\n\t\techo '<div class=\"notice notice-undefined\" id=\"custom-admin-notice-0\"><p>' . esc_html( '' ) . '</p></div>';\n\t}\n);"
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
          "vars": {
                "text": "Welcome to WordPress Playground!",
                "type": "success",
                "dismissible": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

