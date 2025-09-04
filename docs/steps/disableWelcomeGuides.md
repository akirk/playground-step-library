# `disableWelcomeGuides` Step

No description available.

## Type
⚡ **Custom Step**

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "disableWelcomeGuides"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "disableWelcomeGuides"
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
          "step": "disableWelcomeGuides"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
