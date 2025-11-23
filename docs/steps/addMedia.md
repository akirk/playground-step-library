# `addMedia` Step

Add files to the media library.

**[View Source](../../steps/addMedia.ts)**

## Type
⚡ **Custom Step**


## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `downloadUrl` | string | ✅ Yes | Where to download the media from (can be a zip). |


## Examples

### Basic Usage
```json
    {
          "step": "addMedia",
          "vars": {
                "downloadUrl": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
          }
    }
```



## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "addMedia",
          "vars": {
                "downloadUrl": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

