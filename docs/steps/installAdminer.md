# `installAdminer` Step

Install Adminer with auto login link.

**[View Source](../../steps/installAdminer.ts)**

## Type
⚡ **Custom Step**


## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installAdminer"
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "installAdminer"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

