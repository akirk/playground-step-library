# `runPHP` Step

Run code in the context of WordPress.

## Type
🔧 **Built-in Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | textarea | ✅ Yes | The code to run |


## Examples

### Basic Usage
```json
    {
          "step": "runPHP",
          "code": ""
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "runPHP",
          "code": ""
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
          "step": "runPHP",
          "code": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
