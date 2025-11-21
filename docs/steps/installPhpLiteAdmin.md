# `installPhpLiteAdmin` Step

Provide phpLiteAdmin. Password: admin

**[View Source](../../steps/installPhpLiteAdmin.ts)**

## Type
⚡ **Custom Step**


## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installPhpLiteAdmin"
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "installPhpLiteAdmin"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

