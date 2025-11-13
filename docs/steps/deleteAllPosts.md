# `deleteAllPosts` Step

Delete all posts, pages, attachments, revisions and menu items.

## Type
⚡ **Custom Step**

## Parameters

*No parameters defined.*

## Examples

### Basic Usage
```json
    {
          "step": "deleteAllPosts"
    }
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "deleteAllPosts"
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
          "step": "deleteAllPosts"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

