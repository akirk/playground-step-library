# `addMedia` Step

Add files to the media library.

**[View Source](../../steps/addMedia.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`mkdir`](../builtin-step-usage.md#mkdir), [`writeFile`](../builtin-step-usage.md#writefile), [`runPHP`](../builtin-step-usage.md#runphp)

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

## Compiled Output

### Blueprint V1

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

### Blueprint V2

```json
{
  "version": 2,
  "media": [
    "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
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
          "vars": {
                "downloadUrl": "https://s.w.org/style/images/about/WordPress-logotype-wmark.png"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

