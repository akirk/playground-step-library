# `installAdminer` Step

Install Adminer with auto login link.

**[View Source](../../steps/installAdminer.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installAdminer"
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
      "path": "/wordpress/wp-content/mu-plugins/adminer-link.php",
      "data": "<?php\nadd_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {\n$wp..."
    },
    {
      "step": "mkdir",
      "path": "/wordpress/adminer"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/adminer/index.php",
      "data": "<?php\nfunction adminer_object() {\nclass AdminerLoginPasswordLess extends Ad..."
    },
    {
      "step": "writeFile",
      "path": "/wordpress/adminer/adminer.php",
      "data": {
        "resource": "url",
        "url": "https://github.com/vrana/adminer/releases/download/v5.3.0/adminer-5.3.0-en...."
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
          "step": "installAdminer"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

