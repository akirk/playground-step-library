# `importFriendFeeds` Step

No description available.

## Type
⚡ **Custom Step**

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

## Usage in Blueprint

```json
{
  "steps": [
        {
          "step": "importFriendFeeds",
          "opml": ""
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

---

*This documentation was auto-generated from the step definition.*
