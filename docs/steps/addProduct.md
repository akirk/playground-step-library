# `addProduct` Step

Add a WooCommerce product (will install WooCommerce if not present)

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
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
          "title": "Sample Product",
          "description": "<p>This is a great product!</p>",
          "price": "19.99",
          "salePrice": "15.99",
          "sku": "PROD-001",
          "status": "publish"
    }
```

### Advanced Usage
```json
{
  "step": "addProduct",
  "title": "T-Shirt",
  "description": "<p>High quality item with excellent features.</p>",
  "price": "29.95",
  "salePrice": "24.95",
  "sku": "SHIRT-RED-M",
  "status": "draft"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addProduct",
          "title": "Sample Product",
          "description": "<p>This is a great product!</p>",
          "price": "19.99",
          "salePrice": "15.99",
          "sku": "PROD-001",
          "status": "publish"
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
          "title": "Sample Product",
          "description": "<p>This is a great product!</p>",
          "price": "19.99",
          "salePrice": "15.99",
          "sku": "PROD-001",
          "status": "publish"
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



---

*This documentation was auto-generated from the step definition.*
