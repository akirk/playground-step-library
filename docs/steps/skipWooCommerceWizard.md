# `skipWooCommerceWizard` Step

When running WooCommerce, don't show the wizard.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=skipWooCommerceWizard)**

[View Source](../../steps/skipWooCommerceWizard.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin), [`setSiteOptions`](../builtin-step-usage.md#setsiteoptions), [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

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

### Blueprint V1

```json
{
  "landingPage": "/wp-admin/admin.php?page=wc-admin",
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
      "step": "setSiteOptions",
      "options": {
        "woocommerce_onboarding_profile": {
          "completed": true
        }
      }
    },
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/addFilter-0.php",
      "data": "<?php add_filter( 'woocommerce_prevent_automatic_wizard_redirect', '__retur..."
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "plugins": [
    "woocommerce"
  ],
  "muPlugins": [
    {
      "filename": "addFilter-0.php",
      "content": "<?php add_filter( 'woocommerce_prevent_automatic_wizard_redirect', '__return_true' );"
    }
  ],
  "siteOptions": {
    "woocommerce_onboarding_profile": {
      "completed": true
    }
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
          "step": "skipWooCommerceWizard"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

