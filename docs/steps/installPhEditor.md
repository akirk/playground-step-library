# `installPhEditor` Step

Install phEditor. Password: admin

## Type
⚡ **Custom Step**

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "installPhEditor"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "installPhEditor"
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
          "step": "installPhEditor"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
