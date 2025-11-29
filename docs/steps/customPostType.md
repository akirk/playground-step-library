# `customPostType` Step

Register a custom post type.

> 🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=customPostType)**

[View Source](../../steps/customPostType.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `slug` | string | ✅ Yes | Post type key |
| `name` | string | ✅ Yes | The user visible label |
| `supports` | string | ❌ No | Features this post type supports |
| `public` | boolean | ❌ No | Whether the post type is public |


## Examples

### Basic Usage
```json
    {
          "step": "customPostType",
          "vars": {
                "slug": "book",
                "name": "Books"
          }
    }
```

### Advanced Usage
```json
{
          "step": "customPostType",
          "vars": {
                "slug": "music",
                "name": "Music",
                "supports": "['title', 'editor', 'thumbnail']",
                "public": false
          }
    }
```

## Compiled Output

### Blueprint V1

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

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "mkdir",
      "path": "/wordpress/wp-content/mu-plugins"
    },
    {
      "step": "writeFile",
      "path": "/wordpress/wp-content/mu-plugins/customPostType-${stepIndex}.php",
      "data": "<?php add_action( 'init', function() { register_post_type('book', array('public' => true, 'label' => 'Books', 'supports' => \"['title', 'editor']\")); } ); ?>",
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
          "vars": {
                "slug": "book",
                "name": "Books",
                "supports": "['title', 'editor']",
                "public": true
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

