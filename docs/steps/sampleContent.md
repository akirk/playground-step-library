# `sampleContent` Step

Inserts sample pages to the site.

**[View Source](../../steps/sampleContent.ts)**

## Type
⚡ **Custom Step**

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "sampleContent"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "sampleContent"
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
          "step": "sampleContent"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

