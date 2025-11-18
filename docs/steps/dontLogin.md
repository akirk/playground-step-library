# `dontLogin` Step

Prevent automatic login (Playground logs in as admin by default).

**[View Source](../../steps/dontLogin.ts)**

## Type
⚡ **Custom Step**


## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "dontLogin"
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "dontLogin"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

