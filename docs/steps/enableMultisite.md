# `enableMultisite` Step

Enable WordPress Multisite functionality.

**[View Source](../../steps/enableMultisite.ts)**

## Type
🔧 **Built-in Step**

**Compiles to:** `enableMultisite`

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "enableMultisite"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "enableMultisite"
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
          "step": "enableMultisite"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

