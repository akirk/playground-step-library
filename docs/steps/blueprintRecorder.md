# `blueprintRecorder` Step

Record steps made and compile a new blueprint.

## Type
⚡ **Custom Step**

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "blueprintRecorder"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "blueprintRecorder"
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
          "step": "blueprintRecorder"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
