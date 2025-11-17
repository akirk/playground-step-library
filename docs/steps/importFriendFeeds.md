# `importFriendFeeds` Step

Add subscriptions to the Friends plugin.

**[View Source](../../steps/importFriendFeeds.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`installPlugin`](../builtin-step-usage.md#installplugin), [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `opml` | textarea | ✅ Yes | An OPML file, or a list of RSS feed URLs, one per line. |


## Examples

### Basic Usage
```json
    {
          "step": "importFriendFeeds",
          "opml": ""
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "wordpress.org/plugins",
        "slug": "friends"
      },
      "options": {
        "activate": true
      }
    },
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php';if(class_exists('Friends\\Import...",
      "progress": {
        "caption": "Importing feeds to Friends plugin"
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
          "step": "importFriendFeeds",
          "opml": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

