# `generateProducts` Step

Generate WooCommerce products and other data using the WC Smooth Generator plugin (automatically installs WooCommerce and the generator plugin)

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `count` | number | ❌ No | Number of products to generate |
| `orders` | number | ❌ No | Number of orders to generate (optional) |
| `customers` | number | ❌ No | Number of customers to generate (optional) |
| `coupons` | number | ❌ No | Number of coupons to generate (optional) |
| `categories` | number | ❌ No | Number of product categories to generate (optional) |


## Examples

### Basic Usage
```json
    {
          "step": "generateProducts",
          "count": "10",
          "orders": "5",
          "customers": "3",
          "coupons": "2",
          "categories": "3"
    }
```

### Advanced Usage
```json
{
  "step": "generateProducts",
  "count": "25",
  "orders": "10",
  "customers": "5",
  "coupons": "5",
  "categories": "5"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "generateProducts",
          "count": "10",
          "orders": "5",
          "customers": "3",
          "coupons": "2",
          "categories": "3"
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
          "count": "10",
          "orders": "5",
          "customers": "3",
          "coupons": "2",
          "categories": "3"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

