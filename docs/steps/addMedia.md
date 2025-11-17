# `addMedia` Step

Add files to the media library.

**[View Source](../../steps/addMedia.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** `mkdir`, `writeFile`, `runPHP`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `downloadUrl` | string | ✅ Yes | Where to download the media from (can be a zip). |


## Examples

### Basic Usage
```json
    {
          "step": "addMedia",
          "downloadUrl": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
    }
```

## Compiled Output

```json
{
  "steps": [
    {
      "step": "mkdir",
      "path": "/tmp/media"
    },
    {
      "step": "writeFile",
      "path": "/tmp/media/WordPress-logotype-wmark.png",
      "data": {
        "resource": "url",
        "url": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
      }
    },
    {
      "step": "runPHP",
      "progress": {
        "caption": "Importing media to library"
      },
      "code": "<?php\n// DEDUP_STRATEGY: keep_last\nrequire_once '/wordpress/wp-load.php';\nr..."
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
          "step": "addMedia",
          "downloadUrl": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

