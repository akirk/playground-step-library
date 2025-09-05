# `setTT4Homepage` Step

Set the homepage for the twentytwentyfour theme.

## Type
⚡ **Custom Step**

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "setTT4Homepage"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "setTT4Homepage"
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
          "step": "setTT4Homepage"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
