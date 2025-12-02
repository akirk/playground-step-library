# `generateProducts` Step

Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=generateProducts)**

[View Source](../../steps/generateProducts.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin), [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `count` | number | ❌ No | Number of products to generate |
| `orders` | number | ❌ No | Number of orders to generate (optional) |
| `customers` | number | ❌ No | Number of customers to generate (optional) |
| `coupons` | number | ❌ No | Number of coupons to generate (optional) |
| `categories` | number | ❌ No | Number of product categories to generate (optional) |


## Examples

### Basic Usage
```json
    {
          "step": "generateProducts"
    }
```

## Compiled Output

### Blueprint V1

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
      "step": "installPlugin",
      "pluginData": {
        "resource": "url",
        "url": "https://github.com/woocommerce/wc-smooth-generator/releases/download/1.2.2/..."
      },
      "options": {
        "activate": true
      }
    },
    {
      "step": "runPHP",
      "code": "<?php \nrequire_once '/wordpress/wp-load.php';\nerror_log( \"Debugging plugin ...",
      "progress": {
        "caption": "generateProducts: 10 products, 5 orders, 3 customers, 2 coupons, 3 categori..."
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
          "step": "generateProducts",
          "vars": {
                "count": 10,
                "orders": 5,
                "customers": 3,
                "coupons": 2,
                "categories": 3
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

