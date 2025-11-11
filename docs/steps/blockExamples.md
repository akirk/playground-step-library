# `blockExamples` Step

Creates a post with all block examples from registered blocks

## Type
⚡ **Custom Step**

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pluginSlug` | text | ❌ No | Limit to a specific plugin slug (leave empty for all plugins) |
| `postTitle` | text | ❌ No | Title of the post to create |
| `limit` | text | ❌ No | Maximum number of blocks to include (leave empty for no limit) |
| `postId` | text | ❌ No | Post ID to use (defaults to 1000) |
| `landingPage` | text | ❌ No | Set landing page to the post editor (set to false to disable) |


## Examples

### Basic Usage
```json
    {
          "step": "blockExamples",
          "pluginSlug": "",
          "postTitle": "Block Examples",
          "limit": "",
          "postId": "1000",
          "landingPage": "true"
    }
```

### Advanced Usage
```json
{
  "step": "blockExamples",
  "pluginSlug": "gutenberg",
  "postTitle": "Plugin Blocks Showcase",
  "limit": "10",
  "postId": "2000",
  "landingPage": "false"
}
```

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "blockExamples",
          "pluginSlug": "",
          "postTitle": "Block Examples",
          "limit": "",
          "postId": "1000",
          "landingPage": "true"
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
          "step": "blockExamples",
          "pluginSlug": "",
          "postTitle": "Block Examples",
          "limit": "",
          "postId": "1000",
          "landingPage": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```



---

*This documentation was auto-generated from the step definition.*
