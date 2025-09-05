# `customPostType` Step

Register a custom post type.

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ Yes | Post type key |
| `name` | string | ✅ Yes | The user visible label |
| `supports` | string | ❌ No | Features this post type supports |
| `public` | boolean | ❌ No | Whether the post type is public |


## Examples

### Basic Usage
```json
    {
          "step": "customPostType",
          "slug": "book",
          "name": "Books",
          "supports": "['title', 'editor']",
          "public": "true"
    }
```

### Advanced Usage
```json
{
  "step": "customPostType",
  "slug": "music",
  "name": "Music",
  "supports": "['title', 'editor', 'thumbnail']",
  "public": "false"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "customPostType",
          "slug": "book",
          "name": "Books",
          "supports": "['title', 'editor']",
          "public": "true"
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
          "name": "Books",
          "supports": "['title', 'editor']",
          "public": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

---

*This documentation was auto-generated from the step definition.*
