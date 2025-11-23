# `enableMultisite` Step

Enable WordPress Multisite functionality.

**[View Source](../../steps/enableMultisite.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** [`enableMultisite`](../builtin-step-usage.md#enablemultisite)

## Variables

*No variables defined.*

## Examples

### Basic Usage
```json
    {
          "step": "enableMultisite"
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "landingPage": "/wp-admin/network/sites.php",
  "steps": [
    {
      "step": "enableMultisite"
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "enableMultisite"
    }
  ],
  "applicationOptions": {
    "wordpress-playground": {
      "landingPage": "/wp-admin/network/sites.php"
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
          "step": "enableMultisite"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

