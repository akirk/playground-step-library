# `customPostType` Step

Register a custom post type.

**[View Source](../../steps/customPostType.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

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

## Compiled Output

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/customPostType-${stepIndex}.php",
      "data": "<?php add_action( 'init', function() { register_post_type('book', array('pu...",
      "progress": {
        "caption": "customPostType: Books"
      }
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

