# `blockExamples` Step

Creates a post with all block examples from registered blocks

**[View Source](../../steps/blockExamples.ts)**

## Type
⚡ **Custom Step**


## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `blockNamespace` | text | ❌ No | Limit to a specific plugin slug (leave empty for all plugins) |
| `postTitle` | text | ❌ No | Title of the post to create |
| `limit` | text | ❌ No | Maximum number of blocks to include (leave empty for no limit) |
| `postId` | text | ❌ No | Post ID to use (defaults to 1000) |
| `excludeCore` | boolean | ❌ No | Exclude core WordPress blocks |
| `landingPage` | boolean | ❌ No | Set landing page to the post editor |


## Examples

### Basic Usage
```json
    {
          "step": "blockExamples",
          "blockNamespace": "",
          "postTitle": "Block Examples",
          "limit": "",
          "postId": "1000",
          "excludeCore": "false",
          "landingPage": "true"
    }
```

### Advanced Usage
```json
{
  "step": "blockExamples",
  "blockNamespace": "gutenberg",
  "postTitle": "Plugin Blocks Showcase",
  "limit": "10",
  "postId": "2000",
  "excludeCore": "true",
  "landingPage": "false"
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
          "blockNamespace": "",
          "postTitle": "Block Examples",
          "limit": "",
          "postId": "1000",
          "excludeCore": "false",
          "landingPage": "true"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

