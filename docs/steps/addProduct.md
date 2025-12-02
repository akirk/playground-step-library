# `addProduct` Step

Add a WooCommerce product (will install WooCommerce if not present)

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=addProduct)**

[View Source](../../steps/addProduct.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin), [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✅ Yes | The title of the product |
| `description` | textarea | ✅ Yes | The description of the product |
| `price` | string | ❌ No | Regular price (without currency symbol) |
| `salePrice` | string | ❌ No | Sale price (optional, must be less than regular price) |
| `sku` | string | ❌ No | Product SKU/code (optional) |
| `status` | string | ❌ No | Product status |


## Examples

### Basic Usage
```json
    {
          "step": "addProduct",
          "vars": {
                "title": "Sample Product",
                "description": "<p>This is a great product!</p>"
          }
    }
```

### Advanced Usage
```json
{
          "step": "addProduct",
          "vars": {
                "title": "T-Shirt",
                "description": "<p>High quality item with excellent features.</p>",
                "price": "29.95",
                "salePrice": "24.95",
                "sku": "SHIRT-RED-M",
                "status": "draft"
          }
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
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php';\n// Create the product post\n$pr...",
      "progress": {
        "caption": "addProduct: Sample Product"
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
          "step": "addProduct",
          "vars": {
                "title": "Sample Product",
                "description": "<p>This is a great product!</p>",
                "price": "19.99",
                "salePrice": "15.99",
                "sku": "PROD-001",
                "status": "publish"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

## Deprecated Parameters

The following parameters are deprecated but still supported for backward compatibility:

- `productTitle` → Use `title` instead
- `productDescription` → Use `description` instead
- `productPrice` → Use `price` instead
- `productSalePrice` → Use `price` instead
- `productSku` → Use `sku` instead
- `productStatus` → Use `status` instead

