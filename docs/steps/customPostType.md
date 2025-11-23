# `customPostType` Step

Register a custom post type.

**[View Source](../../steps/customPostType.ts)**

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

### V1 (Imperative)

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
      "data": "<?php add_action( 'init', function() { register_post_type('undefined', arra...",
      "progress": {
        "caption": "customPostType: undefined"
      }
    }
  ]
}
```

### V2 (Declarative)

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
      "data": "<?php add_action( 'init', function() { register_post_type('undefined', array('public' => true, 'label' => 'undefined', 'supports' => array( 'title', 'editor' ))); } ); ?>",
      "progress": {
        "caption": "customPostType: undefined"
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

