# `blueprintExtractor` Step

Generate a new blueprint after modifying the WordPress.

**[View Source](../../steps/blueprintExtractor.ts)**

## Type
⚡ **Custom Step**

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "blueprintExtractor"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "blueprintExtractor"
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
          "step": "blueprintExtractor"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

