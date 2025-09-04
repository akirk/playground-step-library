# `customPostType` Step

No description available.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ Yes | Post type key |
| `name` | string | ✅ Yes | The user visible label |


## Examples

### Basic Usage
```json
    {
          "step": "customPostType",
          "slug": "book",
          "name": "Books"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "customPostType",
          "slug": "book",
          "name": "Books"
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
          "step": "customPostType",
          "slug": "book",
          "name": "Books"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
