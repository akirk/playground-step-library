# `skipWooCommerceWizard` Step

When running WooCommerce, don't show the wizard.

**[View Source](../../steps/skipWooCommerceWizard.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `installPlugin`, `runPHP`, `mkdir`, `writeFile`

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "skipWooCommerceWizard"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "wordpress.org/plugins",
        "slug": "woocommerce"
      },
      "options": {
        "activate": true
      }
    },
    {
      "step": "runPHP",
      "code": "<?php require '/wordpress/wp-load.php'; update_option( 'woocommerce_onboard...",
      "progress": {
        "caption": "Skipping WooCommerce setup wizard"
      }
    },
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins/"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/no-more-wizards.php",
      "data": "<?php require '/wordpress/wp-load.php'; add_filter( 'woocommerce_prevent_au..."
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
          "step": "skipWooCommerceWizard"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

