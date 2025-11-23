# `skipWooCommerceWizard` Step

When running WooCommerce, don't show the wizard.

**[View Source](../../steps/skipWooCommerceWizard.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin), [`runPHP`](../builtin-step-usage.md#runphp), [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "skipWooCommerceWizard"
    }
```

## Compiled Output

### V1 (Imperative)

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

### V2 (Declarative)

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
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
      "code": {
        "filename": "code.php",
        "content": "<?php require '/wordpress/wp-load.php'; update_option( 'woocommerce_onboarding_profile', [ 'completed' => true ] );"
      },
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
      "data": "<?php require '/wordpress/wp-load.php'; add_filter( 'woocommerce_prevent_automatic_wizard_redirect', '__return_true' );"
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

