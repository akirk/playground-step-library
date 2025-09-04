# `addProduct` Step

No description available.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productTitle` | string | ✅ Yes | The title of the product |
| `productDescription` | textarea | ✅ Yes | The description of the product |
| `productPrice` | string | ❌ No | Regular price (without currency symbol) |
| `productSalePrice` | string | ❌ No | Sale price (optional, must be less than regular price) |
| `productSku` | string | ❌ No | Product SKU/code (optional) |
| `productStatus` | string | ❌ No | Product status |


## Examples

### Basic Usage
```json
    {
          "step": "addProduct",
          "productTitle": "Sample Product",
          "productDescription": "<p>This is a great product!</p>",
          "productPrice": "19.99",
          "productSalePrice": "15.99",
          "productSku": "PROD-001",
          "productStatus": "publish"
    }
```

### Advanced Usage
```json
{
  "step": "addProduct",
  "productTitle": "T-Shirt",
  "productDescription": "<p>High quality item with excellent features.</p>",
  "productPrice": "29.95",
  "productSalePrice": "24.95",
  "productSku": "SHIRT-RED-M",
  "productStatus": "draft"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "addProduct",
          "productTitle": "Sample Product",
          "productDescription": "<p>This is a great product!</p>",
          "productPrice": "19.99",
          "productSalePrice": "15.99",
          "productSku": "PROD-001",
          "productStatus": "publish"
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
          "productTitle": "Sample Product",
          "productDescription": "<p>This is a great product!</p>",
          "productPrice": "19.99",
          "productSalePrice": "15.99",
          "productSku": "PROD-001",
          "productStatus": "publish"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
