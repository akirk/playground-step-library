# `skipWooCommerceWizard` Step

When running WooCommerce, don't show the wizard.

**[View Source](../../steps/skipWooCommerceWizard.ts)**

## Type
⚡ **Custom Step**


## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "skipWooCommerceWizard"
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

